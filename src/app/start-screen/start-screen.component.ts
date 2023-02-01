import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Game } from 'src/models/game';
import { DialogTestMmodusComponent } from '../dialog-test-mmodus/dialog-test-mmodus.component';

@Component({
  selector: 'app-start-screen',
  templateUrl: './start-screen.component.html',
  styleUrls: ['./start-screen.component.scss']
})
export class StartScreenComponent implements OnInit {

  constructor(private firestore: AngularFirestore, 
    private router: Router,
    public dialog: MatDialog,) { }

  ngOnInit(): void {
  }

  startNewGame() {
    //start game
    let game = new Game;
    this.firestore
    .collection('games')
    .add({ ...game.toJson() })
    .then((gameInfo: any) => this.router.navigateByUrl('/game/' + gameInfo.id));
  }

  openDialog() {
    let dialogRef = this.dialog.open(DialogTestMmodusComponent, {})
  }
}
