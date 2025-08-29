import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import Page from '../page'

describe('Home Page', () => {
  it('renders the main content', () => {
    render(<Page />)

    const mainElement = screen.getByRole('main');
    expect(mainElement).toBeInTheDocument();

    const nextLogo = screen.getByAltText('Next.js logo');
    expect(nextLogo).toBeInTheDocument();
  })
})
