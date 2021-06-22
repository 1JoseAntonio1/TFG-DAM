import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { GrupoMensaje, GrupoMensajeParaHTML, User } from 'src/app/interfaces/interface';
import { ChatService } from 'src/app/services/chat.service';

@Component({
  selector: 'app-chats',
  templateUrl: './chats.page.html',
  styleUrls: ['./chats.page.scss'],
})
export class ChatsPage implements OnInit {

  activeTab:string = "chats"

  //DatosUsuario
  UsuarioEmisor:Observable<User>;
  listaDeUsuariosPosiblesAmigos:Observable<User[]>;
  listaDeUsuariosPosiblesAmigosNoObservable:User[];
  listaDeChatsObservable:Observable<GrupoMensaje[]>;
  listaDeChatsNoObservable:GrupoMensajeParaHTML[];

  constructor(private chatService: ChatService,
              private router: Router,
              public menuCtrl: MenuController) { 
    
  }

  ionViewDidEnter(){
    //Activar el menu
    this.menuCtrl.enable(true, 'main-menu');
  }

  ngOnInit() {
    this.UsuarioEmisor = this.chatService.obtenerDatosUsuarioLogueado()

    this.cargarSeccionChats();
    this.cargarSeccionAmigos();
  }

  segmentChanged(e){
    this.activeTab = e.target.value;
  }

  irAChat(uidEmisor:string, uidReceptor:string){
    this.router.navigate(['/chat', {"uidEmisor" : uidEmisor, "uidReceptor" : uidReceptor}]);
  }

  cargarSeccionChats(){ 
    console.log("Cargando Seccion Chats");       
    this.listaDeChatsObservable = this.chatService.getChatsRecientesConUid()
    this.listaDeChatsObservable.subscribe(dataObservable => {
      this.listaDeChatsNoObservable = []
      if(dataObservable.length > 0){
        dataObservable.forEach(dt => {
          if (dt.uidEmisor_uidReceptor.indexOf(this.chatService.getUIDusuarioLogueado()) != -1){            
            //console.log("EmisorLog: " + this.chatService.getUIDusuarioLogueado() + " /EmisorGrupo: " + dt.uidEmisor);
            if(this.chatService.getUIDusuarioLogueado() == dt.uidEmisor){
              this.chatService.obtenerDatosUsuarioPorUID(dt.uidReceptor).subscribe(dat => {
                var nuevo:GrupoMensajeParaHTML = {
                  uidOtraPersona: dt.uidReceptor, 
                  avatarOtraPersona: dat.avatar,
                  usernameOtraPersona: dat.username,
                  uidYo: dt.uidEmisor,    
                  MensajeUltimoUsuario: dt.MensajeUltimoUsuario 
                }
                this.insertarEnlistaDeChatsNoObservable(nuevo)                  
              })             
            }else{
              this.chatService.obtenerDatosUsuarioPorUID(dt.uidEmisor).subscribe(dat => {
                var nuevo:GrupoMensajeParaHTML = {
                  uidOtraPersona: dt.uidEmisor, 
                  avatarOtraPersona: dat.avatar,
                  usernameOtraPersona: dat.username,
                  uidYo: dt.uidReceptor,    
                  MensajeUltimoUsuario: dt.MensajeUltimoUsuario 
                } 
                this.insertarEnlistaDeChatsNoObservable(nuevo)           
              })               
            }          
          }            
        }); 
        //console.log(this.listaDeChatsNoObservable);          
      }                
    })
  }

  insertarEnlistaDeChatsNoObservable(nuevo:GrupoMensajeParaHTML){
    var esta:boolean = false;
    this.listaDeChatsNoObservable.forEach(element => {
      if(element.usernameOtraPersona == nuevo.usernameOtraPersona){
        esta = true;
      }
    });
    if(!esta){ this.listaDeChatsNoObservable.push(nuevo)  }
  }

  cargarSeccionAmigos(){
    this.listaDeUsuariosPosiblesAmigos =  this.chatService.getUsers();
    this.listaDeUsuariosPosiblesAmigos.subscribe(data => {
      this.listaDeUsuariosPosiblesAmigosNoObservable = []
      data.forEach(element => {
        this.listaDeUsuariosPosiblesAmigosNoObservable.push(element)
      });   
    })
  }

  buscarUsuario( event ){
    this.listaDeUsuariosPosiblesAmigosNoObservable = []
    this.listaDeUsuariosPosiblesAmigos.subscribe(data => {
      data.forEach(element => {
        if (element.username.toUpperCase().indexOf(event.detail.value.toUpperCase()) != -1)
        this.listaDeUsuariosPosiblesAmigosNoObservable.push(element)
      });      
    })
  }
}
