import { render, screen } from '@/lib/test-utils';
import HomePage from '../page';
import { useAuth } from '@/lib/hooks/useAuth';

// Mock the useAuth hook
jest.mock('@/lib/hooks/useAuth');
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('HomePage', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  });

  it('renders hero section', () => {
    render(<HomePage />);
    
    expect(screen.getByText(/book easily/i)).toBeInTheDocument();
    expect(screen.getByText(/with dmc agents/i)).toBeInTheDocument();
    expect(screen.getByText(/connect travel agents with destination management companies/i)).toBeInTheDocument();
  });

  it('shows sign up buttons for unauthenticated users', () => {
    render(<HomePage />);
    
    expect(screen.getByRole('link', { name: /get started free/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /browse dmc agents/i })).toBeInTheDocument();
  });

  it('shows dashboard button for authenticated users', () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: 'ta1',
        email: 'agent@travel.com',
        full_name: 'Travel Agent',
        user_type: 'travel_agent',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
      isAuthenticated: true,
      isLoading: false,
    });
    
    render(<HomePage />);
    
    expect(screen.getByRole('link', { name: /go to dashboard/i })).toBeInTheDocument();
  });

  it('renders features section', () => {
    render(<HomePage />);
    
    expect(screen.getByText(/why choose voyage/i)).toBeInTheDocument();
    expect(screen.getByText(/smart hotel search/i)).toBeInTheDocument();
    expect(screen.getByText(/verified dmc network/i)).toBeInTheDocument();
    expect(screen.getByText(/secure transactions/i)).toBeInTheDocument();
    expect(screen.getByText(/real-time communication/i)).toBeInTheDocument();
  });

  it('renders featured agents section', () => {
    render(<HomePage />);
    
    expect(screen.getByRole('heading', { name: /destination experts/i })).toBeInTheDocument();
    expect(screen.getByText(/yiannis mercourou/i)).toBeInTheDocument();
    expect(screen.getByText(/sarah collins/i)).toBeInTheDocument();
    expect(screen.getByText(/david meyer/i)).toBeInTheDocument();
  });

  it('renders popular destinations section', () => {
    render(<HomePage />);
    
    expect(screen.getByRole('heading', { name: /popular destinations/i })).toBeInTheDocument();
    expect(screen.getAllByText(/santa caterina/i)).toHaveLength(1);
    expect(screen.getAllByText(/le sirenus/i)).toHaveLength(1);
    expect(screen.getAllByText(/sorrento/i)).toHaveLength(2); // Appears in agent location and destination
    expect(screen.getAllByText(/barcelona/i)).toHaveLength(1);
  });

  it('renders call-to-action section', () => {
    render(<HomePage />);
    
    expect(screen.getByText(/ready to connect/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /i'm a travel agent/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /i'm a dmc agent/i })).toBeInTheDocument();
  });

  it('has proper navigation links', () => {
    render(<HomePage />);
    
    const travelAgentLink = screen.getByRole('link', { name: /i'm a travel agent/i });
    const dmcAgentLink = screen.getByRole('link', { name: /i'm a dmc agent/i });
    
    expect(travelAgentLink).toHaveAttribute('href', '/auth/register?type=travel_agent');
    expect(dmcAgentLink).toHaveAttribute('href', '/auth/register?type=dmc_agent');
  });

  it('shows loading state', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: true,
    });
    
    render(<HomePage />);
    
    // Should still render the page content even while loading
    expect(screen.getByText(/book easily/i)).toBeInTheDocument();
  });
});