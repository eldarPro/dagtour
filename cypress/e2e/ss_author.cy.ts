describe('Author link', () => {
  it('house 18', () => {
    cy.visit('/dagtour/houses/18')
    cy.wait(4000)
    cy.screenshot('house18_author', { capture: 'viewport' })
  })
})
