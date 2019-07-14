import { server } from "websocket";
import * as http from "http";
import { Observable, Subject } from "rxjs";
import { filter } from "rxjs/internal/operators";
import { AddressInfo } from "net";

type RequestType = "event" | "data";

interface WebSocketRequest {
  type: RequestType;
}

interface Event extends WebSocketRequest {
  type: "event";
  action: string;
}

export class WebSocketServer {
  private requestSubject = new Subject();
  private wsServer = new server({httpServer: this.httpServer});

  request$ = this.requestSubject.asObservable();
  events$: Observable<Event> = this.requestSubject.pipe(filter((ev: WebSocketRequest): ev is Event => ev.type === "event"));

  btnStart$ = this.events$.pipe(filter(ev => ev.action === "start"));
  btnPause$ = this.events$.pipe(filter(ev => ev.action === "pause"));

  constructor(private httpServer: http.Server) {
    const {port} = this.httpServer.address() as AddressInfo;
    console.log(`  Websocket Server is running at http://localhost:${port}`);
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
