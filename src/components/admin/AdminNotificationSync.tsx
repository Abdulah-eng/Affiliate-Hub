"use client";

import { useEffect, useRef } from "react";
import { getAdminSidebarStats } from "@/app/actions/admin";
import { useSession } from "next-auth/react";

export function AdminNotificationSync() {
  const { data: session } = useSession();
  const prevStats = useRef({ pendingKyc: 0, pendingMissions: 0, openTickets: 0, pendingRedemptions: 0 });

  useEffect(() => {
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "CSR")) return;

    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    const checkStats = async () => {
      try {
        const stats = await getAdminSidebarStats();
        
        let message = "";
        if (stats.pendingKyc > prevStats.current.pendingKyc) {
          message = `New KYC Application detected (${stats.pendingKyc} pending)`;
        } else if (stats.pendingRedemptions > prevStats.current.pendingRedemptions) {
          message = `New Redemption Request received (${stats.pendingRedemptions} pending)`;
        } else if (stats.pendingMissions > prevStats.current.pendingMissions) {
          message = `New Mission Review submitted (${stats.pendingMissions} pending)`;
        } else if (stats.openTickets > prevStats.current.openTickets) {
          message = `New Support Ticket received (${stats.openTickets} open)`;
        }

        if (message && "Notification" in window && Notification.permission === "granted") {
          new Notification("Affiliate Hub Admin", {
            body: message,
            icon: "/favicon.ico"
          });
        }

        prevStats.current = stats;
      } catch (err) {
        console.error("Notification Sync Error:", err);
      }
    };

    const interval = setInterval(checkStats, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, [session]);

  return null;
}
