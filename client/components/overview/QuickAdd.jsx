"use client";

import { useState } from "react";
import { Building2, ChevronDown, DoorOpen, Home, Plus, UserPlus } from "lucide-react";
import CreateLandlordDialog from "@/components/landlords/CreateLandlordDialog";
import CreatePropertyDialog from "@/components/properties/CreatePropertyDialog";
import CreateUnitDialog from "@/components/units/CreateUnitDialog";
import CreateTenantDialog from "@/components/tenants/CreateTenantDialog";
import { useWorkspace } from "@/components/layout/WorkspaceProvider";

const options = [
  { type: "landlord", label: "Add landlord", Icon: Building2 },
  { type: "property", label: "Add property", Icon: Home },
  { type: "unit", label: "Add unit", Icon: DoorOpen },
  { type: "tenant", label: "Add tenant", Icon: UserPlus },
];

export default function QuickAdd({ landlords = [], properties = [], units = [] }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [type, setType] = useState(null);
  const { activeLandlord } = useWorkspace();

  const scopedLandlords = activeLandlord
    ? landlords.filter((landlord) => landlord.id === activeLandlord.id)
    : landlords;
  const scopedProperties = activeLandlord
    ? properties.filter((property) => property.landlordId === activeLandlord.id)
    : properties;
  const scopedPropertyIds = new Set(scopedProperties.map((property) => property.id));
  const scopedUnits = activeLandlord
    ? units.filter((unit) => scopedPropertyIds.has(unit.propertyId))
    : units;
  const visibleOptions = activeLandlord
    ? options.filter((option) => option.type !== "landlord")
    : options;

  function choose(entityType) {
    setMenuOpen(false);
    setType(entityType);
  }

  return (
    <>
      <div className="relative">
        <button
          className="flex h-[38px] items-center justify-center gap-[7px] rounded-md border border-primary bg-primary px-[13px] font-semibold text-inverse"
          onClick={() => setMenuOpen((open) => !open)}
          type="button"
        >
          <Plus size={18} />
          <span>Quick add</span>
          <ChevronDown size={14} />
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-[46px] w-[200px] rounded-[7px] border border-default bg-surface p-1 shadow-xl">
            {visibleOptions.map((option) => {
              const Icon = option.Icon;
              return (
                <button
                  className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-secondary hover:bg-sidebar"
                  key={option.type}
                  onClick={() => choose(option.type)}
                  type="button"
                >
                  <Icon size={16} className="text-primary" />
                  {option.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {type === "landlord" && <CreateLandlordDialog onClose={() => setType(null)} />}
      {type === "property" && (
        <CreatePropertyDialog landlords={scopedLandlords} onClose={() => setType(null)} />
      )}
      {type === "unit" && (
        <CreateUnitDialog properties={scopedProperties} onClose={() => setType(null)} />
      )}
      {type === "tenant" && (
        <CreateTenantDialog
          landlords={scopedLandlords}
          properties={scopedProperties}
          units={scopedUnits}
          onClose={() => setType(null)}
        />
      )}
    </>
  );
}
