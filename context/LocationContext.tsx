import React, { createContext, ReactNode, useContext, useState } from 'react';

type LocationData = {
  latitude: number;
  longitude: number;
} | null;

type LocationContextType = {
  selectedLocation: LocationData;
  setSelectedLocation: (location: LocationData) => void;
};

const LocationContext = createContext<LocationContextType>({
  selectedLocation: null,
  setSelectedLocation: () => {},
});

export const LocationProvider = ({ children }: { children: ReactNode }) => {
  const [selectedLocation, setSelectedLocation] = useState<LocationData>(null);

  return (
    <LocationContext.Provider value={{ selectedLocation, setSelectedLocation }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => useContext(LocationContext);
