"use client";

import { useSyncExternalStore } from "react";
import { toastStore } from "@/lib/toast-store";

export const useToasts = () => useSyncExternalStore(toastStore.subscribe, toastStore.getSnapshot, toastStore.getSnapshot);
