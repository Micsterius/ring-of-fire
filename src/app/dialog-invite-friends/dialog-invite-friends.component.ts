import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Game } from 'src/models/game';
import { DialogFaqComponent } from '../dialog-faq/dialog-faq.component';
import { GeneralService } from '../shares/services/general.service';

@Component({
  selector: 'app-dialog-invite-friends',
  templateUrl: './dialog-invite-friends.component.html',
  styleUrls: ['./dialog-invite-friends.component.scss']
})
export class DialogInviteFriendsComponent implements OnInit {

  @ViewChild('myForm') myForm!: ElementRef;
  @ViewChild('buttonInviteFriends') buttonInviteFriends!: ElementRef;

  @ViewChild('mailFieldOne') mailFieldOne!: ElementRef;
  @ViewChild('mailFieldTwo') mailFieldTwo!: ElementRef;
  @ViewChild('mailFieldThree') mailFieldThree!: ElementRef;
  @ViewChild('mailFieldFour') mailFieldFour!: ElementRef;
  @ViewChild('mailFieldFive') mailFieldFive!: ElementRef;
  url;
  mailFields = [''];
  id;

  constructor(
    private firestore: AngularFirestore,
    private router: Router,
    public dialogRef: MatDialogRef<DialogFaqComponent>,
    private generalService: GeneralService) { }

  ngOnInit(): void {
  }

  startNewGame() {
    //start game
    let game = new Game;
    this.firestore
      .collection('games')
      .add({ ...game.toJson() })
      .then((gameInfo: any) => {
        this.id = gameInfo.id
        this.router.navigateByUrl('/game/' + gameInfo.id)
        this.sendMails()
      });
    this.generalService.testModus = false;
  }

  sendMails() {
    let mailFieldOne = this.mailFieldOne.nativeElement;
    if (this.mailFields.length == 1) this.sendMail(mailFieldOne);
    if (this.mailFields.length == 2) this.sendTwoMails(mailFieldOne);
    if (this.mailFields.length == 3) this.sendThreeMails(mailFieldOne);
    if (this.mailFields.length == 4) this.sendFourMails(mailFieldOne);
    if (this.mailFields.length == 5) this.sendFiveMails(mailFieldOne);

    this.closeDialog();
  }

  closeDialog() {
    this.dialogRef.close();
  }

  sendTwoMails(mailFieldOne) {
    let mailFieldTwo = this.mailFieldTwo.nativeElement
    this.sendMail(mailFieldOne);
    this.sendMail(mailFieldTwo)
  }

  sendThreeMails(mailFieldOne) {
    let mailFieldTwo = this.mailFieldTwo.nativeElement
    let mailFieldThree = this.mailFieldThree.nativeElement
    this.sendMail(mailFieldOne);
    this.sendMail(mailFieldTwo);
    this.sendMail(mailFieldThree);
  }

  sendFourMails(mailFieldOne) {
    let mailFieldTwo = this.mailFieldTwo.nativeElement
    let mailFieldThree = this.mailFieldThree.nativeElement
    let mailFieldFour = this.mailFieldFour.nativeElement
    this.sendMail(mailFieldOne);
    this.sendMail(mailFieldTwo);
    this.sendMail(mailFieldThree);
    this.sendMail(mailFieldFour);
  }

  sendFiveMails(mailFieldOne) {
    let mailFieldTwo = this.mailFieldTwo.nativeElement
    let mailFieldThree = this.mailFieldThree.nativeElement
    let mailFieldFour = this.mailFieldFour.nativeElement
    let mailFieldFive = this.mailFieldFive.nativeElement
    this.sendMail(mailFieldOne);
    this.sendMail(mailFieldTwo);
    this.sendMail(mailFieldThree);
    this.sendMail(mailFieldFour);
    this.sendMail(mailFieldFive);
  }

  addMailField() {
    this.mailFields.push('')
  }

  deleteMailField() {
    this.mailFields.pop()
  }

  async sendMail(mailField) {
    let buttonInviteFriends = this.buttonInviteFriends.nativeElement;
    this.disableContactForm(mailField, buttonInviteFriends);
    await this.giveMessageToServer(mailField);
    this.showMessageConfirmation();
    this.activateContactForm(mailField, buttonInviteFriends);
  }

  showMessageConfirmation() {
    // this.dialog.open(MessageDialogComponent, {})
  }

  async giveMessageToServer(mailField) {
    let fd = new FormData();
    let url = `https://ring-of-fire-f1cee.web.app/game/${this.id}`
    fd.append('url', url)
    fd.append('message', `Do you want to join my poker game? ${url}`)
    fd.append('mail', mailField.value)

    await fetch('https://michael-strauss.developerakademie.net/texas-holdem/send_mail/send_mail.php', {
      method: 'POST',
      body: fd
    });
  }

  disableContactForm(mailField, buttonInviteFriends) {
    mailField.disabled = true;
    buttonInviteFriends.disabled = true;
  }

  activateContactForm(mailField, buttonInviteFriends) {
    mailField.disabled = false;
    buttonInviteFriends.disabled = false;
    this.clearInputFields(mailField);
  }

  clearInputFields(mailField) {
    mailField.value = '';
  }

  email = new FormControl('', [Validators.required, Validators.email]);

  getErrorMessageMail() {
    if (this.email.hasError('required')) {
      return 'You must enter a value';
    }

    return this.email.hasError('email') ? 'Not a valid email' : '';
  }
}
