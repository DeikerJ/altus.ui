import {
    createContext
    , useContext
    , useState
    , useEffect
} from "react"

import { authService } from "../services"

const AuthContext = createContext()

export const useAuth = () => {
    const context = useContext(AuthContext)
    if(!context){
        throw new Error("useAuth debe usarse dentro de AuthProvider")
    }
    return context
}

export const AuthProvider = ( {children} ) => {
    const [user, setUser] = useState(null)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [loading, setLoading] = useState(false)

    useEffect( () => {
        setLoading(true);
        const checkAuth = () => {
            if( authService.isAuthenticated()){
                const currentUser = authService.getCurrentUser()
                if( currentUser ){
                    setUser( currentUser )
                    setIsAuthenticated(true)
                }
            }
            setLoading(false);
        };
        checkAuth();
    } ,[])

    const login = async (email, password) => {
        try {
            setLoading(true);
            await authService.login(email, password);
            const currentUser = authService.getCurrentUser()
            if (currentUser) {
                setUser(currentUser);
                setIsAuthenticated(true);
            }
            return true;
        }catch(error){
            throw error
        }finally{
            setLoading(false);
        }
    };

    const register = async (name, lastname, email, phone,  password) => {
        try {
            setLoading(true);
            const result = await authService.register(name, lastname, email, phone, password);
            return result;
        } catch (error) {
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        authService.logout();
        setUser(null);
        setIsAuthenticated(false);
    }

    const validateToken = () => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            logout();
            return false;
        }

        try {
            const tokenPayload = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Date.now() / 1000;

            if (tokenPayload.exp < currentTime) {
                logout();
                return false;
            }
            return true;
        } catch (error) {
            logout();
            return false;
        }
    };

    const value = {
        user,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
        validateToken
    }

    return(
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )

}