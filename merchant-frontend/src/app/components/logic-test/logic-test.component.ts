import { Component } from '@angular/core';
import { persons } from './json/persons'
import { emails } from './json/emails';

@Component({
  selector: 'app-logic-test',
  templateUrl: './logic-test.component.html',
  styleUrls: ['./logic-test.component.css']
})


export class LogicTestComponent {
  sortedPeople: any = [];
  filteredPeople: any = [];
  peopleWithEmails: any = [];
  emailsWithoutPerson: string = "";
  invalidEmails: string = "";


  ngOnInit() {
    this.getPersonData();
    this.getEmailsData();
  }

  getPersonData() {
    const peopleWithoutAddress = persons.filter(person => !person.hasOwnProperty('address'));
    const clonedPeopleWithoutAddress = JSON.parse(JSON.stringify(peopleWithoutAddress));

    const sortedPeople = clonedPeopleWithoutAddress.sort((a: any, b: any) => a.name.localeCompare(b.name));

    this.sortedPeople = sortedPeople;
    console.log(sortedPeople);

    const filteredPeople = sortedPeople.filter((person: any) => {
      const ageInRange = person.age >= 20 && person.age <= 30;
      const nameStartsWithHOrL = person.name.charAt(0).toUpperCase() === 'H' || person.name.charAt(0).toUpperCase() === 'L';
      return ageInRange && nameStartsWithHOrL;
    });

    this.filteredPeople = filteredPeople;
    console.log(filteredPeople);
  }

  getEmailsData() {
    const peopleWithEmails = persons.filter(person => {
      const personEmail = person.email.toLowerCase();
      return emails.includes(personEmail);
    });

    this.peopleWithEmails = peopleWithEmails;
    console.log(peopleWithEmails);

    const emailsWithoutPerson = emails.filter(email => {
      const emailLower = email.toLowerCase();
      return !persons.some(person => person.email.toLowerCase() === emailLower);
    });

    const emailsString = emailsWithoutPerson.join(' | ');

    console.log(emailsString);
    this.emailsWithoutPerson = emailsString;

    const validEmails = emails.filter(email => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    });

    const invalidEmails = emails.filter(email => !validEmails.includes(email));
    const invalidEmailsString = invalidEmails.join(' | ');
    this.invalidEmails = invalidEmailsString;
    console.log(invalidEmailsString);
  }
}
