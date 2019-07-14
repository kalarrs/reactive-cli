import {Component} from '@angular/core';
import {webSocket} from 'rxjs/webSocket';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'reactive-cli';
  subject = webSocket('ws://localhost:3000');

  constructor() {
    console.log('WHAT?');
    this.subject.subscribe(res => console.log('Got a response!', res));

    this.subject.next({
      type: 'event',
      action: 'pause'
    });

    // this.subject.complete();
  }
}
