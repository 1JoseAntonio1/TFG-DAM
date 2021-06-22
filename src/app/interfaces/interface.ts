import * as firebase from 'firebase/app';

export interface TaskI {
    id?: string;
    task?: string;
    priority?: string;    
}

export interface User {
    uid?: string;
    email?: string;
    displayName?: string;
    username?: string;
    avatar?: number;
}

export interface Mensaje {
    uidEmisor?: string;
    uidReceptor?: string;
    mensajeTexto?: string;
    idGrupo?: number;
    createdAt?: any ; 
}

export interface chatPersonal {
    Emisor?: string;
    uidEmisor?: string;
    Receptor?: string;
    uidReceptor?: string;
}

export interface GrupoMensaje { 
    uid?: string;   
    idGrupo?: number;
    uidEmisor?: string;
    uidReceptor?: string;    
    MensajeUltimoUsuario?: string;
    uidEmisor_uidReceptor?: string;
    fechaUltimaActualizacion?: any ;     
}

export interface GrupoMensajeParaHTML {
    uidOtraPersona?: string; 
    avatarOtraPersona?: number;
    usernameOtraPersona?: string; 
    uidYo?: string;    
    MensajeUltimoUsuario?: string; 
}
