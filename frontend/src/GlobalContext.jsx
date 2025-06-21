
import { createContext, useContext, useState ,useRef, useEffect} from "react";

const GlobalContext = createContext();

export function GlobalProvider({ children }) {

    
    const [user, setUser] = useState("ronak");
    

    
  return (
    <GlobalContext.Provider value={{ user }}>
      {children}
    </GlobalContext.Provider>
  );
}

export function useGlobal() {
  return useContext(GlobalContext);
}
