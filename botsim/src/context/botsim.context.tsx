import { createContext, useContext, useState } from "react";
import { useSimulatorLifecycle } from "../simulatorBridge/useSimulatorLifecycle";

interface BotSimContextType {
  armed: boolean;
  rearmOnSettingsClose: () => void;
  settingsOpen: boolean;
  setSettingsOpen: (open: boolean) => void;
}

const BotSimContext = createContext<BotSimContextType | undefined>(undefined);


interface Props {
  children: React.ReactNode
}

export const BotSimContextProvider = ({ children }: Props): React.ReactNode => {
  const { armed, rearmOnSettingsClose } = useSimulatorLifecycle()
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <BotSimContext.Provider value={{ armed, rearmOnSettingsClose, settingsOpen, setSettingsOpen }}>
      {children}
    </BotSimContext.Provider>
  );
};


export const useBotSimContext = (): BotSimContextType => {
  const context = useContext(BotSimContext);
  if (context === undefined) {
    throw new Error("useBotSimContext must be used within an BotSimContextProvider");
  }
  return context;
};
