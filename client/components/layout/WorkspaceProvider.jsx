"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { adaptLandlords } from "@/lib/adapters/landlords";

const WorkspaceContext = createContext(null);

export function WorkspaceProvider({ landlords, children }) {
  const [workspaceLandlords, setWorkspaceLandlords] = useState(landlords || []);
  const [openLandlordIds, setOpenLandlordIds] = useState([]);
  const [activeLandlordId, setActiveLandlordId] = useState(null);

  useEffect(() => {
    let active = true;
    fetch("/api/landlords")
      .then(async (response) => (response.ok ? response.json() : { items: [] }))
      .then((payload) => {
        if (active && Array.isArray(payload.items)) setWorkspaceLandlords(adaptLandlords(payload.items));
      })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  const activeLandlord = workspaceLandlords.find((landlord) => landlord.id === activeLandlordId) || null;
  const openLandlords = openLandlordIds
    .map((id) => workspaceLandlords.find((landlord) => landlord.id === id))
    .filter(Boolean);

  function openLandlord(id) {
    setOpenLandlordIds((current) => (current.includes(id) ? current : [...current, id]));
    setActiveLandlordId(id);
  }

  function closeLandlord(id) {
    setOpenLandlordIds((current) => {
      const remaining = current.filter((item) => item !== id);
      if (activeLandlordId === id) setActiveLandlordId(remaining.at(-1) || null);
      return remaining;
    });
  }

  return (
    <WorkspaceContext.Provider
      value={{
        landlords: workspaceLandlords,
        openLandlords,
        activeLandlord,
        activeLandlordId,
        openLandlord,
        closeLandlord,
        showAgency: () => setActiveLandlordId(null),
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  return useContext(WorkspaceContext);
}
