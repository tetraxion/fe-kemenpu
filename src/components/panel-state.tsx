"use client";

import { createContext, useContext } from "react";

interface PanelState {
  open: boolean;
  setOpen: (open: boolean) => void;
}

// the toggle is in the top bar, the panel in the map page
export const PanelContext = createContext<PanelState>({ open: true, setOpen: () => {} });

export function usePanel(): PanelState {
  return useContext(PanelContext);
}
