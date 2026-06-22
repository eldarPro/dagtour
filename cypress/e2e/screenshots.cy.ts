describe('Screenshots', () => {
  it('house 18 detail', () => {
    cy.visit('/dagtour/houses/18')
    cy.wait(4000)
    cy.screenshot('house18', { capture: 'viewport' })
  })

  it('house 18 reviews', () => {
    cy.visit('/dagtour/reviews/house/18')
    cy.wait(4000)
    cy.screenshot('reviews18', { capture: 'viewport' })
  })
})
