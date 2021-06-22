import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { GrupoMensaje, Mensaje, User } from '../interfaces/interface';
import * as firebase from 'firebase/app';
import { Observable } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import * as M from 'minimatch';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  //Variables
  currentUser: User = null

  constructor(private afAuth: AngularFireAuth,
              private afs: AngularFirestore) 
  { 
    this.afAuth.onAuthStateChanged(user => {
      console.log('Cambio: ', user)
      this.currentUser = user      
    })
  }

  desloguarUsuario(){
    this.currentUser = null
  }

  getUIDusuarioLogueado(){
    return this.currentUser.uid;
  }

  getUsuarioActual(){
    return this.currentUser;
  }

  obtenerDatosUsuarioLogueado(){
    return this.afs.doc<User>(`users/${this.currentUser.uid}`).valueChanges() as Observable<User>
  }

  obtenerDatosUsuarioPorUID(uid:string){    
    return this.afs.doc<User>(`users/${uid}`).valueChanges() as Observable<User>
  }

  obtenerDatosUsuarioPorUIDDeChat(uid:string){    
    this.afs.doc<User>(`users/${uid}`).valueChanges().subscribe(data => {
      return data
    }) 
  }

  obtenerObservableGrupoMensajes(uid:string){        
    return this.afs.doc<User>(`idGruposMensajes/${uid}`).valueChanges() as Observable<GrupoMensaje>
  }

  async actualizarDatosGrupoMensaje(uid:string, idGrupo:number, uidEmisor:string, uidReceptor:string, MensajeUltimoUsuario:string){
    this.afs.doc(
        `idGruposMensajes/${uid}`
    ).set({
      uid : uid,
      idGrupo: idGrupo,
      uidEmisor: uidEmisor,
      uidReceptor: uidReceptor,
      MensajeUltimoUsuario: MensajeUltimoUsuario,
      uidEmisor_uidReceptor: uidEmisor + "-" + uidReceptor,
      fechaUltimaActualizacion : firebase.default.firestore.FieldValue.serverTimestamp()
    })
  }

  async signUp({ email, username, password }){
    const credenciales = await this.afAuth.createUserWithEmailAndPassword( email, password );    
    const uid = credenciales.user.uid  

    return this.afs.doc(
        `users/${uid}`
    ).set({
      uid,
      username: username,
      email: credenciales.user.email,    
      avatar:  Math.round(Math.random() * (50 - 0) + 1)
    })
  }

  signIn({ email, password }) {
    return this.afAuth.signInWithEmailAndPassword(email, password);
  }

  signOut(){
    return this.afAuth.signOut();
  }

  addChatMensaje(uidEmisor:string, uidReceptor:string, mensajeTexto:string, idGrupo:number ){ 
    //console.log("Nuevo Mensaje: UE: " + uidEmisor + " - UR: " + uidReceptor + " - Mensaje: " +  mensajeTexto + " - ID: " +  idGrupo);
    
    return this.afs.collection('mensajes').add({
      uidEmisor: uidEmisor,
      uidReceptor: uidReceptor,
      mensajeTexto:  mensajeTexto,
      idGrupo: idGrupo,
      createdAt: firebase.default.firestore.FieldValue.serverTimestamp()      
    })
  }

  getUsers(){
    return this.afs.collection('users', ref => ref.orderBy('username')).valueChanges({ idField: 'uid' }) as Observable<User[]>;
  }

  getUserForMsg(msgFromId, users: User[]):string{
    for (let user of users){    
      if (user.uid == msgFromId) {
        return user.email;        
      }
    }
    return 'Deleted';
  }

  getChatMessages(idGrupo){
    return this.afs.collection('mensajes', ref => ref.where('idGrupo','==', idGrupo).orderBy('createdAt')).valueChanges() as Observable<Mensaje[]>
  }

  comprobarCodigoComunMensaje(uidEmisor:string, uidReceptor:string){
    return new Promise<GrupoMensaje[]>((resolved) => {  
      this.afs.collection('idGruposMensajes', ref => ref.where('uidEmisor','==', uidEmisor).where('uidReceptor','==', uidReceptor).limit(1)).valueChanges({ idField: 'uid' }).subscribe((data:GrupoMensaje[]) => {
        resolved(data) 
      })
    })
    
  }

  crearCodigoComunMensajes(uidEmisor:string, uidReceptor:string, idGruposMensajes){
    return new Promise((resolved) => {   
      this.afs.collection('idGruposMensajes').add({
        idGrupo: idGruposMensajes,
        uidEmisor: uidEmisor,
        uidReceptor: uidReceptor,
        uidEmisor_uidReceptor: uidEmisor + "-" + uidReceptor,
        fechaUltimaActualizacion: firebase.default.firestore.FieldValue.serverTimestamp()
      })
      resolved('ok') 
    })  
  }

  getObtenerIdMaximoGruposMensajes(){
    return new Promise<number>((resolved) => {
      this.afs.collection('idGruposMensajes').valueChanges().subscribe(data => { 
        resolved(data.length + 1)
      })
    })   
  }

  getListadosGrupos(uidUsuario:string){
    return new Promise<number[]>((resolved) => {
      var listaIds:number[] = [];
      this.afs.collection('idGruposMensajes', ref => ref.where('uidEmisor','==', uidUsuario)).valueChanges().subscribe((dataEmisor:GrupoMensaje[]) => {
        if (dataEmisor.length > 0){
          dataEmisor.forEach(element => {
            listaIds.push(element.idGrupo)
          });      
        }
        this.afs.collection('idGruposMensajes', ref => ref.where('uidReceptor','==', uidUsuario)).valueChanges().subscribe((dataReceptor:GrupoMensaje[]) => {
          if (dataReceptor.length > 0){
            dataReceptor.forEach(element => {
              listaIds.push(element.idGrupo)
            });
          }           
          resolved(listaIds);
        })      
      }) 
    })   
      
  } 

  getChatsRecientesConLista(listaIds:number[]){    
    return this.afs.collection('idGruposMensajes', ref => ref.where('idGrupo','in', listaIds)).valueChanges() as Observable<GrupoMensaje[]>  
  } 

  getChatsRecientesConUid(){    
    return this.afs.collection('idGruposMensajes', ref => ref.orderBy('fechaUltimaActualizacion', "desc")).valueChanges() as Observable<GrupoMensaje[]>  
  } 

}
