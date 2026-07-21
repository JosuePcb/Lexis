// Barrel exports — Re-exporta todos los componentes para simplificar los imports en otros archivos.
// Permite hacer: import { Navbar, Roomcard } from "./components"

export { default as Navbar } from "./Navbar/Navbar"

export {default as Roomcard } from "./RoomCard/RoomCard"

export { CreateClassroomModal } from "./ClassroomModal/CreateClassroomModal"
export { JoinClassroomModal } from "./ClassroomModal/JoinClassroomModal"
