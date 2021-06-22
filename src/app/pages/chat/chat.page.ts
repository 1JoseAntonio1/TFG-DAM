import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, MenuController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { chatPersonal, GrupoMensaje, Mensaje, User } from 'src/app/interfaces/interface';
import { ChatService } from 'src/app/services/chat.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {

  //Variables
  @ViewChild(IonContent) content: IonContent;

  mensajes: Observable<Mensaje[]>;
  nuevoMensaje = '';
  existeGrupo:boolean = true;

  UsarioReceptor: Observable<User>;
  UsuarioEmisor:Observable<User>;
  //datosRelacion:Observable<GrupoMensaje>;
  datosRelacionEmisorReceptor:GrupoMensaje = {};


  constructor(private chatService: ChatService,
              private router: Router,
              private route: ActivatedRoute,
              public menuCtrl: MenuController) 
  {                
  }
    
  ionViewDidEnter(){
    //Desactivar el menu
    this.menuCtrl.enable(false, 'main-menu');
  }

  ngOnInit() {
    this.configuracionesDeEntrada()  
  }

  comprobacionesCodigoComunMensajes(uidEmisor:string, uidReceptor:string){    
    this.chatService.comprobarCodigoComunMensaje(uidEmisor, uidReceptor).then((data) => {     
      if(data.length > 0){ 
        console.log("Existe su Grupo en el Orden Normal");
        this.datosRelacionEmisorReceptor.idGrupo = data[0].idGrupo;
        this.datosRelacionEmisorReceptor.uid = data[0].uid;
        this.mensajes = this.chatService.getChatMessages(this.datosRelacionEmisorReceptor.idGrupo); 
      }else{
        this.chatService.comprobarCodigoComunMensaje(uidReceptor, uidEmisor).then((dataInversa) => {
          console.log(dataInversa);
          if(dataInversa.length > 0){  
            console.log("Existe su Grupo en el Orden Inverso");             
            this.datosRelacionEmisorReceptor.idGrupo = dataInversa[0].idGrupo;
            this.datosRelacionEmisorReceptor.uid = dataInversa[0].uid;
            this.mensajes = this.chatService.getChatMessages(this.datosRelacionEmisorReceptor.idGrupo);  
          }else{
            console.log("No existe su Grupo");
            this.existeGrupo = false            
          }  
        }).catch((err) => {    });
      }
    }).catch((err) => {    });
  }

  enviarMensaje() { 
    if(!this.existeGrupo){
      this.existeGrupo = true
      this.chatService.getObtenerIdMaximoGruposMensajes().then(idGrupoNuevo => {
        this.datosRelacionEmisorReceptor.idGrupo = idGrupoNuevo;            
        this.chatService.crearCodigoComunMensajes(this.datosRelacionEmisorReceptor.uidEmisor, this.datosRelacionEmisorReceptor.uidReceptor, this.datosRelacionEmisorReceptor.idGrupo).then(res => {
          this.chatService.comprobarCodigoComunMensaje(this.datosRelacionEmisorReceptor.uidEmisor, this.datosRelacionEmisorReceptor.uidReceptor).then((dataNueva) => {
            console.log("Existe su Grupo en Recien Creado");   
            this.datosRelacionEmisorReceptor.uid = dataNueva[0].uid;  
            this.nuevoMensajeParaEnviar(this.datosRelacionEmisorReceptor.uid,this.datosRelacionEmisorReceptor.idGrupo, this.datosRelacionEmisorReceptor.uidEmisor, this.datosRelacionEmisorReceptor.uidReceptor, this.nuevoMensaje)  
          }).catch((err) => {    });
      
          this.mensajes = this.chatService.getChatMessages(this.datosRelacionEmisorReceptor.idGrupo)
        });
      });
    }else{
        this.nuevoMensajeParaEnviar(this.datosRelacionEmisorReceptor.uid,this.datosRelacionEmisorReceptor.idGrupo, this.datosRelacionEmisorReceptor.uidEmisor, this.datosRelacionEmisorReceptor.uidReceptor, this.nuevoMensaje)
    }
  }

  nuevoMensajeParaEnviar(uid:string, idGrupo:number, uidEmisor:string, uidReceptor:string, MensajeUltimoUsuario:string){
    this.chatService.actualizarDatosGrupoMensaje(uid, idGrupo, uidEmisor, uidReceptor, MensajeUltimoUsuario)
    this.chatService.addChatMensaje(uidEmisor, uidReceptor, MensajeUltimoUsuario, idGrupo).then(() => {
      this.nuevoMensaje = '';
      this.content.scrollToBottom();
      this.ionViewWillEnter();
    })
  }

  signOut(){
    this.chatService.signOut().then(() => {
      this.router.navigateByUrl('/', { replaceUrl:true })
    })
  }

  ionViewWillEnter(){
    let chatSection = document.getElementById("chat");
    chatSection.scrollTop = chatSection.scrollHeight;
  }  

  configuracionesDeEntrada(){
    this.route.params.subscribe(params => {
      this.datosRelacionEmisorReceptor.uidEmisor = params['uidEmisor'];
      this.datosRelacionEmisorReceptor.uidReceptor = params['uidReceptor']   
      this.UsuarioEmisor = this.chatService.obtenerDatosUsuarioPorUID(params['uidEmisor']);      
      this.UsarioReceptor = this.chatService.obtenerDatosUsuarioPorUID(params['uidReceptor']);       
      this.comprobacionesCodigoComunMensajes(params['uidEmisor'], params['uidReceptor'])
    });   
  }
}
