import {Component} from '@angular/core';
import {webSocket} from 'rxjs/webSocket';
import {merge, Observable, Subject} from 'rxjs';
import {map, mapTo, scan, shareReplay, startWith, tap} from 'rxjs/operators';
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

  webSocketSubject = webSocket('ws://localhost:3000');

  initialDemoState: DemoState = {
    command: null,
    process: null
  };

  commandChange$ = this.commandControl.valueChanges
    .pipe(tap(command => {
      this.webSocketSubject.next({
        type: 'command',
        value: {
          command
        }
      });
    }));

  processChangeSubject = new Subject();
  processChange$ = this.processChangeSubject.asObservable();

  stateCommands$ = merge(
    this.commandChange$.pipe(map((command) => ({command}))),
    this.processChange$
  );

  state$: Observable<DemoState> = this.webSocketSubject.asObservable()
    .pipe(map(v => v as DemoState));

  constructor(private fb: FormBuilder) {
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
