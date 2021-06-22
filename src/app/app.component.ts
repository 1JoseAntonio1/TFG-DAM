import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ChatService } from './services/chat.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(private router: Router,
              private chatService: ChatService) {}

  // desloguear(){
  //   this.chatService.desloguarUsuario();
  //   this.router.navigateByUrl('/chats', { replaceUrl: true})
  // }
}
