import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-faq',
  templateUrl: './dialog-faq.component.html',
  styleUrls: ['./dialog-faq.component.scss']
})
export class DialogFaqComponent implements OnInit {
  srcUrl: string = 'https://www.casinos.de/online-poker/texas-holdem/';
  panelOpenState = false;
  constructor(
    public dialogRef: MatDialogRef<DialogFaqComponent>
  ) { }

  ngOnInit(): void {
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
