import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Game } from 'src/models/game';

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
  mailFields = ['0'];

  constructor(
    private firestore: AngularFirestore,
    private router: Router) { }

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

  createArrayOfFriendsMails() {
  }

  addMailField() {
    let nbr = this.mailFields.length
    this.mailFields.push(`${nbr}`)
  }

  deleteMailField() {
    this.mailFields.pop()
  }

  async sendMail() {
    let mailField = this.mailFieldOne.nativeElement
    let buttonInviteFriends = this.buttonInviteFriends.nativeElement
    this.disableContactForm(mailField, buttonInviteFriends)
    await this.giveMessageToServer(mailField)
    this.showMessageConfirmation()
    this.activateContactForm(mailField, buttonInviteFriends);
  }

  showMessageConfirmation() {
    // this.dialog.open(MessageDialogComponent, {})
  }

  async giveMessageToServer(mailField) {
    let fd = new FormData();
    fd.append('url', this.url)
    fd.append('mail', mailField.value)

    await fetch('https://michael-strauss.developerakademie.net/my-website/send_mail/send_mail.php', {
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
