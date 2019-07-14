import { server } from "websocket";
import * as http from "http";
import { Observable, Subject } from "rxjs";
import { filter } from "rxjs/internal/operators";


type RequestType = "event" | "data";

interface WebSocketRequest {
  type: RequestType;
}

interface Event extends WebSocketRequest {
  type: "event";
  action: string;
}

export class WebSocketServer {
  private port = 1337;

  private requestSubject = new Subject();
  private httpServer = http.createServer();
  private wsServer = new server({httpServer: this.httpServer});

  request$ = this.requestSubject.asObservable();
  events$: Observable<Event> = this.requestSubject.pipe(filter((ev: WebSocketRequest): ev is Event => ev.type === "event"));

  btnStart$ = this.events$.pipe(filter(ev => ev.action === "start"));
  btnPause$ = this.events$.pipe(filter(ev => ev.action === "pause"));

  constructor() {
    this.httpServer.listen(this.port, () => {
      console.log(`  Websocket Server is running at http://localhost:${this.port}`);
    });
    this.wsServer.on("request", req => {
      const connection = req.accept(null, req.origin);
      connection.on("message", message => {
        if (message.type === "utf8") {
          const obj = JSON.parse(message.utf8Data);
          this.requestSubject.next(obj);
        }
      });
    });
  }
}
