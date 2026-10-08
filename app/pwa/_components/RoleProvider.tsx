"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { PwaRole } from "@/packages/core/rbac";
import { firstTabForRole, type PwaTabId } from "./roleNav";

const STORAGE_KEY = "sk-pwa-role";

type PwaRoleContextValue = {
  role: PwaRole;
  setRole: (role: PwaRole) => void;
  tab: PwaTabId;
  setTab: (tab: PwaTabId) => void;
};

const PwaRoleContext = createContext<PwaRoleContextValue | null>(null);

function isPwaRole(value: string): value is PwaRole {
  return value === "admin" || value === "accountant" || value === "warehouse" || value === "delivery";
}

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<PwaRole>("admin");
  const [tab, setTab] = useState<PwaTabId>("tong-quan");

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored && isPwaRole(stored)) {
        setRoleState(stored);
        setTab(firstTabForRole(stored));
      }
    } catch {
      /* private mode */
    }
  }, []);

  const setRole = useCallback((next: PwaRole) => {
    setRoleState(next);
    setTab(firstTabForRole(next));
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* private mode */
    }
  }, []);

  const value = useMemo(
    () => ({ role, setRole, tab, setTab }),
    [role, setRole, tab]
  );

  return <PwaRoleContext.Provider value={value}>{children}</PwaRoleContext.Provider>;
}

export function usePwaRole(): PwaRoleContextValue {
  const ctx = useContext(PwaRoleContext);
  if (!ctx) throw new Error("usePwaRole must be used within RoleProvider");
  return ctx;
}
