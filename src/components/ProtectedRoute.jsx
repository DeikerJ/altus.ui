import {Navigate} from "react-router-dom"
import { useAuth } from "../context/AuthContext"

//practicamente el useAuth que se creo antes esta ayudando a probar 
// la autenticacion


const ProtectedRoute = ({children}) =>{
   const{isAuthenticated, loading } = useAuth()

   if(loading){
    return(
    <div className ="min-h-screen flex items-center justify-center">
        <div className="text-center">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-white"></span>
            </div>
        </div>
    </div>
    )
   }

//Si no esta autenticado redirigir al login
//Navigate es el que redirecciona al login 
// el replace es para reemplazar la url y nos manda al login 
// si esta autenticado retorna el children

if(!isAuthenticated){
    return<Navigate to= "/login" replace/>

}

return children
} 

export default ProtectedRoute