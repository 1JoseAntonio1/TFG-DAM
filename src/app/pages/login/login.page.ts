import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController, MenuController } from '@ionic/angular';
import { ChatService } from 'src/app/services/chat.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  credencialesFormulario: FormGroup

  constructor(private fb: FormBuilder,
              private router: Router,
              private alertController: AlertController,
              private loadingController: LoadingController,
              private chatService: ChatService,
              public menuCtrl: MenuController) { }
  
  ionViewDidEnter(){
    //Desactivar el menu
    this.menuCtrl.enable(false, 'main-menu');
  }

  ngOnInit() {
    this.credencialesFormulario = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    })
  }

  async signIn() {
    const loading = await this.loadingController.create();
    await loading.present();

    this.chatService.signIn(this.credencialesFormulario.value).then((res) => {
      loading.dismiss();
      this.router.navigateByUrl('/chats', { replaceUrl: true})
    },async err => {
      loading.dismiss();
      this.crearAlerta(':(', err.message, 'OK'); 
    });
  }

  async crearAlerta(header:string, message:string, button:string){
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: [button]
    });

    await alert.present();
  }

  get email(){
    return this.credencialesFormulario.get('email');    
  }

  get password(){
    return this.credencialesFormulario.get('password');
  }

}
