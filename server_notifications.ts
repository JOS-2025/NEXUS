import { LocalDB } from './server_db.js';
import { 
  AppNotification, 
  NotificationPreference, 
  NotificationCampaign, 
  NotificationLog, 
  NotificationEvent, 
  NotificationQueueItem, 
  PushSubscriptionItem, 
  AutomationRule, 
  CampaignSegment, 
  DeliveryAttempt, 
  TrackingEvent 
} from './src/types.js';

export class NotificationEngine {
  /**
   * Triggers an automated notification flow based on a system event.
   */
  public static async triggerEvent(eventType: string, payload: any): Promise<void> {
    const db = LocalDB.load();
    
    // 1. Create event log
    const event: NotificationEvent = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      eventType,
      payload,
      processed: false,
      createdAt: new Date().toISOString()
    };
    if (!db.notificationEvents) db.notificationEvents = [];
    db.notificationEvents.push(event);

    // 2. Find active automation rules matching this event
    const activeRules = (db.automationRules || []).filter(r => r.triggerEvent === eventType && r.isActive);
    
    for (const rule of activeRules) {
      const template = (db.notificationTemplates || []).find(t => t.id === rule.templateId);
      if (!template) continue;

      // 3. Determine target audience based on event type
      let targetEmails: string[] = [];

      if (eventType === 'security_event' && payload.email) {
        // Direct single-user alert
        targetEmails = [payload.email];
      } else if (eventType === 'comment_reply' && payload.parentAuthorEmail) {
        // Direct reply alert
        targetEmails = [payload.parentAuthorEmail];
      } else if (eventType === 'author_followed' && payload.authorEmail) {
        // Direct follow alert
        targetEmails = [payload.authorEmail];
      } else if (eventType === 'article_published') {
        // Segment-based or AI-recommended targets
        const category = payload.category;
        
        // Match users whose interests or bookmarks align, or all subscribed users
        targetEmails = Object.keys(db.readerProfiles).filter(email => {
          const profile = db.readerProfiles[email];
          const hasAffinity = profile?.interests?.includes(category) || 
                              (db.articles || []).some(art => db.articles?.find(a => a.id === art.id)?.category === category);
          
          // Or if subscribed
          const isSubscribed = (db.subscribers || []).some(s => s.email === email && s.status === 'subscribed');
          return hasAffinity || isSubscribed;
        });

        // Ensure we always have some users to demo
        if (targetEmails.length === 0) {
          targetEmails = Object.keys(db.readerProfiles);
        }
      } else {
        // General: all users in readerProfiles
        targetEmails = Object.keys(db.readerProfiles);
      }

      // 4. Send to all targets following their preferences
      for (const email of targetEmails) {
        const userProfile = db.readerProfiles[email];
        const userName = userProfile ? userProfile.displayName : email.split('@')[0];
        
        // Substitute variables in title & body
        const vars = {
          userName,
          userEmail: email,
          createdAt: new Date().toLocaleString(),
          timestamp: new Date().toLocaleString(),
          ...payload
        };

        const resolvedTitle = this.substituteVars(template.title, vars);
        const resolvedBody = this.substituteVars(template.body, vars);
        const deepLink = payload.deepLink || (payload.articleId ? `/?article=${payload.articleId}` : '/');

        // Check preferences
        const prefs = this.getUserPreferences(email);
        const prefCat = template.category || 'System';

        // Check channel states
        const sendInApp = prefs.categories[prefCat]?.inApp !== false;
        const sendPush = prefs.categories[prefCat]?.push !== false;
        const sendEmail = prefs.categories[prefCat]?.email !== false;

        const notificationId = `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;

        // Deliver In-App
        if (sendInApp) {
          const notif: AppNotification = {
            id: notificationId,
            userId: email,
            title: resolvedTitle,
            body: resolvedBody,
            category: prefCat,
            channel: 'in_app',
            isRead: false,
            isArchived: false,
            isDeleted: false,
            createdAt: new Date().toISOString(),
            deepLink
          };
          if (!db.notifications) db.notifications = [];
          db.notifications.push(notif);
          this.logDelivery(undefined, notificationId, email, 'in_app', 'success');
        }

        // Deliver Push (Simulated FCM Log)
        if (sendPush) {
          const hasSub = (db.pushSubscriptions || []).some(s => s.userEmail === email);
          this.logDelivery(
            undefined, 
            notificationId, 
            email, 
            'push', 
            hasSub ? 'success' : 'failed', 
            hasSub ? undefined : 'No push subscription registered'
          );
        }

        // Deliver Email (Simulated Resend Log)
        if (sendEmail) {
          this.logDelivery(undefined, notificationId, email, 'email', 'success');
        }
      }
    }

    event.processed = true;
    LocalDB.save(db);
  }

  /**
   * Helper to replace {{var}} fields
   */
  private static substituteVars(text: string, vars: Record<string, any>): string {
    let output = text;
    for (const [key, val] of Object.entries(vars)) {
      output = output.replace(new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'gi'), String(val || ''));
    }
    return output;
  }

  /**
   * Retrieve notification preferences for user, with default values if non-existent.
   */
  public static getUserPreferences(email: string): NotificationPreference {
    const db = LocalDB.load();
    if (!db.notificationPreferences) db.notificationPreferences = {};
    const key = email.toLowerCase().trim();

    if (!db.notificationPreferences[key]) {
      // Seed default enabled preferences for all channels and categories
      db.notificationPreferences[key] = {
        userEmail: key,
        categories: {
          'Articles': { email: true, push: true, inApp: true },
          'AI News': { email: true, push: true, inApp: true },
          'Comments': { email: true, push: true, inApp: true },
          'Replies': { email: true, push: true, inApp: true },
          'Resources': { email: true, push: true, inApp: true },
          'Promotions': { email: false, push: false, inApp: true }, // promo default off for less spam
          'Security': { email: true, push: true, inApp: true },
          'System': { email: true, push: true, inApp: true }
        }
      };
      LocalDB.save(db);
    }

    return db.notificationPreferences[key];
  }

  /**
   * Update preferences for a user
   */
  public static updateUserPreferences(email: string, categories: Record<string, { email: boolean; push: boolean; inApp: boolean }>): NotificationPreference {
    const db = LocalDB.load();
    if (!db.notificationPreferences) db.notificationPreferences = {};
    const key = email.toLowerCase().trim();

    db.notificationPreferences[key] = {
      userEmail: key,
      categories
    };
    LocalDB.save(db);
    return db.notificationPreferences[key];
  }

  /**
   * Execute an Administrator-designed Campaign immediately or scheduled.
   */
  public static async sendCampaign(campaignId: string): Promise<void> {
    const db = LocalDB.load();
    if (!db.notificationCampaigns) db.notificationCampaigns = [];
    
    const campIdx = db.notificationCampaigns.findIndex(c => c.id === campaignId);
    if (campIdx === -1) throw new Error("Campaign not found");
    
    const campaign = db.notificationCampaigns[campIdx];
    const template = (db.notificationTemplates || []).find(t => t.id === campaign.templateId);
    if (!template) throw new Error("Template not found");

    campaign.status = 'sending';
    LocalDB.save(db);

    // Filter segment targets
    const segment = (db.campaignSegments || []).find(s => s.id === campaign.segmentId);
    let targetEmails = Object.keys(db.readerProfiles);

    if (segment && segment.filters) {
      const filters = segment.filters;
      targetEmails = targetEmails.filter(email => {
        const profile = db.readerProfiles[email];
        if (!profile) return false;
        
        // 1. Filter by role
        if (filters.userRoles && filters.userRoles.length > 0) {
          if (!filters.userRoles.includes(profile.role || 'registered')) return false;
        }

        // 2. Filter by newsletter / subscription state
        if (filters.newsletterStatus) {
          const isSub = (db.subscribers || []).some(s => s.email === email && s.status === 'subscribed');
          if (filters.newsletterStatus === 'subscribed' && !isSub) return false;
          if (filters.newsletterStatus === 'unsubscribed' && isSub) return false;
        }

        // 3. Filter by Interest Categories
        if (filters.interestCategories && filters.interestCategories.length > 0) {
          const userInterests = profile.interests || [];
          const matches = filters.interestCategories.some(cat => userInterests.includes(cat));
          if (!matches) return false;
        }

        return true;
      });
    }

    let sent = 0;
    
    for (const email of targetEmails) {
      const userProfile = db.readerProfiles[email];
      const userName = userProfile ? userProfile.displayName : email.split('@')[0];

      const vars = {
        userName,
        userEmail: email,
        campaignName: campaign.name,
        createdAt: new Date().toLocaleString()
      };

      const resolvedTitle = this.substituteVars(template.title, vars);
      const resolvedBody = this.substituteVars(template.body, vars);
      const deepLink = `/?campaign=${campaign.id}`;

      // Respect preferences
      const prefs = this.getUserPreferences(email);
      const prefCat = template.category || 'System';

      const sendInApp = prefs.categories[prefCat]?.inApp !== false;
      const sendPush = prefs.categories[prefCat]?.push !== false;
      const sendEmail = prefs.categories[prefCat]?.email !== false;

      const notificationId = `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;

      if (sendInApp) {
        const notif: AppNotification = {
          id: notificationId,
          userId: email,
          title: resolvedTitle,
          body: resolvedBody,
          category: prefCat,
          channel: 'in_app',
          isRead: false,
          isArchived: false,
          isDeleted: false,
          createdAt: new Date().toISOString(),
          deepLink,
          campaignId
        };
        if (!db.notifications) db.notifications = [];
        db.notifications.push(notif);
        this.logDelivery(campaignId, notificationId, email, 'in_app', 'success');
        sent++;
      }

      if (sendPush) {
        const hasSub = (db.pushSubscriptions || []).some(s => s.userEmail === email);
        this.logDelivery(
          campaignId, 
          notificationId, 
          email, 
          'push', 
          hasSub ? 'success' : 'failed', 
          hasSub ? undefined : 'No push subscription registered'
        );
        if (hasSub) sent++;
      }

      if (sendEmail) {
        this.logDelivery(campaignId, notificationId, email, 'email', 'success');
        sent++;
      }
    }

    campaign.status = 'completed';
    campaign.sentCount = sent;
    LocalDB.save(db);
  }

  /**
   * Records tracking event (Email image loading or dynamic click)
   */
  public static trackEvent(type: 'open' | 'click', email: string, campaignId?: string, notificationId?: string): void {
    const db = LocalDB.load();
    if (!db.trackingEvents) db.trackingEvents = [];

    const tracking: TrackingEvent = {
      id: `trk-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      type,
      userEmail: email.toLowerCase().trim(),
      campaignId,
      notificationId,
      device: Math.random() > 0.4 ? 'desktop' : 'mobile',
      browser: Math.random() > 0.6 ? 'chrome' : Math.random() > 0.5 ? 'safari' : 'firefox',
      createdAt: new Date().toISOString()
    };
    db.trackingEvents.push(tracking);

    // Update campaign metrics
    if (campaignId && db.notificationCampaigns) {
      const idx = db.notificationCampaigns.findIndex(c => c.id === campaignId);
      if (idx !== -1) {
        if (type === 'open') db.notificationCampaigns[idx].openCount++;
        if (type === 'click') db.notificationCampaigns[idx].clickCount++;
      }
    }

    LocalDB.save(db);
  }

  /**
   * In-App notification retrieval
   */
  public static getUserNotifications(email: string, filters: { category?: string; status?: string; q?: string; page?: number; limit?: number }): { list: AppNotification[]; total: number } {
    const db = LocalDB.load();
    const key = email.toLowerCase().trim();
    
    let list = (db.notifications || []).filter(n => n.userId === key && !n.isDeleted);

    if (filters.category && filters.category !== 'all') {
      list = list.filter(n => n.category === filters.category);
    }

    if (filters.status === 'unread') {
      list = list.filter(n => !n.isRead && !n.isArchived);
    } else if (filters.status === 'archived') {
      list = list.filter(n => n.isArchived);
    } else if (filters.status === 'active') {
      list = list.filter(n => !n.isArchived);
    }

    if (filters.q) {
      const q = filters.q.toLowerCase();
      list = list.filter(n => n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q));
    }

    // Sort newest first
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const offset = (page - 1) * limit;

    return {
      list: list.slice(offset, offset + limit),
      total: list.length
    };
  }

  /**
   * Internal logging for deliveries (mock engines)
   */
  private static logDelivery(campaignId: string | undefined, notificationId: string, email: string, channel: 'email' | 'push' | 'in_app', status: 'success' | 'failed', error?: string) {
    const db = LocalDB.load();
    if (!db.notificationLogs) db.notificationLogs = [];
    if (!db.deliveryAttempts) db.deliveryAttempts = [];

    const logId = `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    
    const log: NotificationLog = {
      id: logId,
      campaignId,
      notificationId,
      userEmail: email,
      channel,
      status,
      errorMessage: error,
      createdAt: new Date().toISOString()
    };
    db.notificationLogs.push(log);

    const attempt: DeliveryAttempt = {
      id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      queueId: notificationId,
      channel,
      status,
      error,
      attemptedAt: new Date().toISOString()
    };
    db.deliveryAttempts.push(attempt);
  }

  /**
   * Gathers full enterprise notification analytics for admin dashboard
   */
  public static getAnalytics(): any {
    const db = LocalDB.load();
    const logs = db.notificationLogs || [];
    const tracking = db.trackingEvents || [];

    const totalSent = logs.length;
    const delivered = logs.filter(l => l.status === 'success').length;
    const failed = totalSent - delivered;
    
    const opened = tracking.filter(t => t.type === 'open').length;
    const clicked = tracking.filter(t => t.type === 'click').length;

    const deliveryRate = totalSent > 0 ? parseFloat(((delivered / totalSent) * 100).toFixed(1)) : 100;
    const openRate = delivered > 0 ? parseFloat(((opened / delivered) * 100).toFixed(1)) : 0;
    const clickRate = opened > 0 ? parseFloat(((clicked / opened) * 100).toFixed(1)) : 0;
    const ctr = delivered > 0 ? parseFloat(((clicked / delivered) * 100).toFixed(1)) : 0;

    // Device breakdown
    let desktopOpen = 0;
    let mobileOpen = 0;
    tracking.forEach(t => {
      if (t.device === 'desktop') desktopOpen++;
      if (t.device === 'mobile') mobileOpen++;
    });

    const totalTracking = tracking.length || 1;

    // Dynamic analytics summaries
    return {
      totalSent,
      delivered,
      opened,
      clicked,
      failed,
      deliveryRate,
      openRate,
      clickRate,
      ctr,
      deviceStatistics: {
        desktop: parseFloat(((desktopOpen / totalTracking) * 100).toFixed(1)),
        mobile: parseFloat(((mobileOpen / totalTracking) * 100).toFixed(1))
      },
      recentLogs: logs.slice(-20).reverse(),
      campaignMetrics: (db.notificationCampaigns || []).map(c => ({
        id: c.id,
        name: c.name,
        type: c.type,
        status: c.status,
        sentCount: c.sentCount,
        openRate: c.sentCount > 0 ? parseFloat(((c.openCount / c.sentCount) * 100).toFixed(1)) : 0,
        ctr: c.sentCount > 0 ? parseFloat(((c.clickCount / c.sentCount) * 100).toFixed(1)) : 0
      }))
    };
  }

  /**
   * Seeds mock metrics and activity to simulate an enterprise-grade live system on load.
   */
  public static seedMockAnalytics(adminEmail: string) {
    const db = LocalDB.load();
    if (!db.trackingEvents || db.trackingEvents.length === 0) {
      db.trackingEvents = [];
      db.notificationLogs = [];
      
      const sampleEmails = [adminEmail, 'sarah.chen@neurapulse.ai', 'marcus.vance@bootstrappers.com', 'elena.r@productivityhub.io', 'demo.reader@gmail.com'];
      const channels: ('email' | 'push' | 'in_app')[] = ['in_app', 'email', 'push'];
      const categories = ['Articles', 'AI News', 'Comments', 'Replies', 'System'];
      
      // Generate some historic sent logs
      for (let i = 0; i < 185; i++) {
        const email = sampleEmails[Math.floor(Math.random() * sampleEmails.length)];
        const channel = channels[Math.floor(Math.random() * channels.length)];
        const isSuccess = Math.random() > 0.08;
        const createdAt = new Date(Date.now() - Math.random() * 10 * 24 * 3600 * 1000).toISOString();
        
        const logId = `log-mock-${i}`;
        const notifId = `notif-mock-${i}`;
        
        db.notificationLogs.push({
          id: logId,
          userEmail: email,
          channel,
          status: isSuccess ? 'success' : 'failed',
          errorMessage: isSuccess ? undefined : 'Delivery timeout',
          createdAt
        });

        if (isSuccess) {
          // Simulation click and opens
          const isOpened = Math.random() > 0.4;
          if (isOpened) {
            db.trackingEvents.push({
              id: `trk-open-${i}`,
              type: 'open',
              userEmail: email,
              notificationId: notifId,
              device: Math.random() > 0.5 ? 'desktop' : 'mobile',
              browser: Math.random() > 0.5 ? 'chrome' : 'safari',
              createdAt
            });

            const isClicked = Math.random() > 0.35;
            if (isClicked) {
              db.trackingEvents.push({
                id: `trk-click-${i}`,
                type: 'click',
                userEmail: email,
                notificationId: notifId,
                device: Math.random() > 0.5 ? 'desktop' : 'mobile',
                browser: Math.random() > 0.5 ? 'chrome' : 'safari',
                createdAt
              });
            }
          }
        }
      }

      LocalDB.save(db);
    }
  }
}
