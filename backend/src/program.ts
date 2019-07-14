import { merge, Observable, pipe, Subject, UnaryFunction } from "rxjs";
import {
  distinctUntilChanged,
  map,
  mapTo,
  pluck,
  scan,
  shareReplay,
  startWith,
  tap,
  withLatestFrom
} from "rxjs/internal/operators";
import { WebSocketServer } from "./websocket-server";
import { ExpressServer } from "./express-server";

enum CliStatus {
  Stopped,
  Running,
  Paused,
  Completed
}

enum CliStateKeys {
  Command = "command",
  Status = "status",
  Process = "process"
}

interface ControllableProcess {
}

interface CliState {
  command: string;
  status: CliStatus;
  process: ControllableProcess;
}


// == CONSTANTS ===========================================================
const initialCliState: CliState = {
  command: null,
  status: CliStatus.Stopped,
  process: null
};

const expressServer = new ExpressServer();
const webSocketServer = new WebSocketServer(expressServer.httpServer);

// == BASE OBSERVABLES  ====================================================
// == SOURCE OBSERVABLES ==================================================
// All our source observables are extracted into Counter class to hide away all the low leven bindings.
// == STATE OBSERVABLES ==================================================
const programmaticCommandSubject = new Subject<CliState>();
const cliCommands$ = merge(
  webSocketServer.btnStart$.pipe(mapTo({status: CliStatus.Running})),
  webSocketServer.btnPause$.pipe(mapTo({status: CliStatus.Paused})),
  programmaticCommandSubject.asObservable()
);

const cliState$: Observable<CliState> = cliCommands$
  .pipe(
    startWith(initialCliState),
    scan((cliState: CliState, command) => ({...cliState, ...command})),
    shareReplay(1)
  );

// == INTERMEDIATE OBSERVABLES ============================================

const command$ = cliState$.pipe(pluck<CliState, CliState[CliStateKeys.Command]>(CliStateKeys.Command));
const status$ = cliState$.pipe(queryChange<CliState, CliState[CliStateKeys.Status]>(CliStateKeys.Status));
const process$ = cliState$.pipe(queryChange<CliState, CliState[CliStateKeys.Process]>(CliStateKeys.Process));


// == UI INPUTS ===========================================================
const renderCommandChange$ = command$.pipe(tap(n => console.log(`Command is now: ${n}`)));
const renderStatusChange$ = command$.pipe(tap(n => console.log(`Status is now: ${n}`)));


// == UI OUTPUTS ==========================================================
// const commandFromTick$ = process$
//   .pipe(
//     withLatestFrom(counterState$, (_, counterState) => ({
//       [ConterStateKeys.count]: counterState.count,
//       [ConterStateKeys.countUp]: counterState.countUp,
//       [ConterStateKeys.countDiff]: counterState.countDiff
//     })),
//     tap(({count, countUp, countDiff}) => programmaticCommandSubject.next({count: count + countDiff * (countUp ? 1 : -1)}))
//   );

// SetTimeout is purely for console.log ORDERING. I want the console.log from HTTP and WS server to show up first.
setTimeout(() => {
  merge(
    // Input side effect
    renderCommandChange$,
    renderStatusChange$
    // Outputs side effect
    // commandFromTick$
  )
    .subscribe();
}, 10);


// == HELPER ===============================================================
// == CUSTOM OPERATORS =====================================================
// == CREATION METHODS ====================================================
// == OPERATORS ===========================================================
function queryChange<T, I>(key: string): UnaryFunction<Observable<T>, Observable<I>> {
  return pipe(
    pluck<T, I>(key),
    distinctUntilChanged<I>()
  );
}
