import {Component} from '@angular/core';
import {webSocket} from 'rxjs/webSocket';
import {merge, Observable, Subject} from 'rxjs';
import {map, mapTo, scan, shareReplay, startWith} from 'rxjs/operators';
import {FormBuilder, FormGroup} from '@angular/forms';


interface DemoState {
  command: string;
  process: {
    isRunning: boolean;
    exitCode: 0 | 1;
    stdOut: string;
    command: string;
  };
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  commandFormGroup = this.fb.group({
    command: [null, {updateOn: 'blur'}]
  });

  commandControl = this.commandFormGroup.get('command');

  // subject = webSocket('ws://localhost:3000');

  initialDemoState: DemoState = {
    command: null,
    process: null
  };

  commandChange$ = this.commandControl.valueChanges;

  processChangeSubject = new Subject();
  processChange$ = this.processChangeSubject.asObservable();

  stateCommands$ = merge(
    this.commandChange$.pipe(map((command) => ({command}))),
    this.processChange$
  );

  state$: Observable<DemoState> = this.stateCommands$.pipe(
    startWith(this.initialDemoState),
    scan((currentDemoState: DemoState, command): DemoState => {
      return {...currentDemoState, ...command};
    }),
    shareReplay(1)
  );

  constructor(private fb: FormBuilder) {

    this.commandControl.valueChanges.subscribe(e => console.log(e));
    /*
    console.log('WHAT?');
    this.subject.subscribe(res => console.log('Got a response!', res));

    this.subject.next({
      type: 'event',
      action: 'pause'
    });

    // this.subject.complete();
     */
  }

  execute(command: string) {
    this.processChangeSubject.next({
      process: {
        id: 1,
        isRunning: true,
        exitCode: null,
        command
      }
    });

    setTimeout(() => {
      this.processChangeSubject.next({
        process: {
          id: 1,
          isRunning: false,
          exitCode: 0,
          command
        }
      });
    }, 10000);
  }
}

// command ["cat file.txt", "curl xyz"]
// process []
