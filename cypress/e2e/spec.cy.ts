import { faker } from '@faker-js/faker';

describe('Login Test', () => {
  let nomeFake: string;
  let emailFake: string;
  let senhaFake: string;

  const login = (email: string, password: string) => {
    cy.visit('http://localhost:4200/');
    cy.url().should('include', '/login');

    cy.get('input[formcontrolname="email"]')
      .type(email)
      .should('have.value', email);
    cy.get('input[formcontrolname="senha"]')
      .type(password)
      .should('have.value', password);
    cy.get('button[type="submit"]').click();
  };

  const fillCreateUserForm = (
    name: string,
    email: string,
    password: string
  ) => {
    cy.get('input[formcontrolname="name"]')
      .type(name)
      .should('have.value', name);
    cy.get('input[formcontrolname="email"]')
      .type(email)
      .should('have.value', email);
    cy.get('input[formcontrolname="password"]')
      .type(password)
      .should('have.value', password);
    cy.get('select[formcontrolname="profile"]').select('user');
    cy.get('button[type="submit"]').should('not.be.disabled').click();
    cy.get('.form-container', { timeout: 10000 }).should('not.exist');
    cy.get('.user-table').contains(name);
  };

  const logout = () => {
    cy.get('.logout-button').should('be.visible').click();
    cy.url().should('include', '/login');
  };

  beforeEach(() => {
    nomeFake = faker.person.fullName();
    emailFake = faker.internet.email();
    senhaFake = faker.internet.password();
  });

  it('should enter email and password and submit the form', () => {
    login('jhonatas.fender@gmail.com', '123456');
    cy.url().should('include', '/');

    cy.get('.add-user-button').should('exist').click();
    cy.get('.form-container').should('be.visible');

    fillCreateUserForm(nomeFake, emailFake, senhaFake);

    logout();

    login(emailFake, senhaFake);
    cy.url().should('include', '/');

    cy.get('.add-user-button').should('not.exist');
  });
});
