describe('Home', () => {
  it('home page', () => {
    cy.visit('/dagtour/home')
    cy.wait(4000)
    cy.screenshot('home_page', { capture: 'viewport' })
  })
  it('houses list', () => {
    cy.visit('/dagtour/houses')
    cy.wait(4000)
    cy.screenshot('houses_page', { capture: 'viewport' })
  })
})
