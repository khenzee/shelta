"use client";

import { createContext, useContext, useState } from "react";

const WorkspaceContext = createContext(null);

export function WorkspaceProvider({ landlords, children }) {
  const [openLandlordIds, setOpenLandlordIds] = useState([]);
  const [activeLandlordId, setActiveLandlordId] = useState(null);

  const activeLandlord = landlords.find((landlord) => landlord.id === activeLandlordId) || null;
  const openLandlords = openLandlordIds
    .map((id) => landlords.find((landlord) => landlord.id === id))
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
        landlords,
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
