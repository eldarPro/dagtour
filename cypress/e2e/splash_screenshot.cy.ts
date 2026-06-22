describe('Splash', () => {
  it('splash screen', () => {
    cy.visit('/dagtour/')
    cy.wait(500)
    cy.screenshot('splash', { capture: 'viewport' })
  })
})
