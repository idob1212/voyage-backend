import { render, screen } from '@/lib/test-utils';
import { EmptyState } from '../empty-state';
import { Search } from 'lucide-react';
import userEvent from '@testing-library/user-event';

describe('EmptyState Component', () => {
  it('renders title and description', () => {
    render(
      <EmptyState 
        title="No results found" 
        description="Try adjusting your search filters" 
      />
    );
    
    expect(screen.getByText('No results found')).toBeInTheDocument();
    expect(screen.getByText('Try adjusting your search filters')).toBeInTheDocument();
  });

  it('renders with icon', () => {
    render(
      <EmptyState 
        icon={Search}
        title="No results found" 
        description="Try adjusting your search filters" 
      />
    );
    
    // Icon should be present but hidden from screen readers
    const iconContainer = screen.getByRole('status').querySelector('[aria-hidden="true"]');
    expect(iconContainer).toBeInTheDocument();
  });

  it('renders action button when provided', async () => {
    const handleAction = jest.fn();
    const user = userEvent.setup();
    
    render(
      <EmptyState 
        title="No results found" 
        description="Try adjusting your search filters"
        action={{
          label: "Reset filters",
          onClick: handleAction
        }}
      />
    );
    
    const button = screen.getByRole('button', { name: /reset filters/i });
    expect(button).toBeInTheDocument();
    
    await user.click(button);
    expect(handleAction).toHaveBeenCalledTimes(1);
  });

  it('has proper accessibility attributes', () => {
    render(
      <EmptyState 
        title="No results found" 
        description="Try adjusting your search filters" 
      />
    );
    
    const container = screen.getByRole('status');
    expect(container).toHaveAttribute('aria-live', 'polite');
  });

  it('applies custom className', () => {
    render(
      <EmptyState 
        title="No results found" 
        description="Try adjusting your search filters"
        className="custom-empty-state"
      />
    );
    
    const container = screen.getByRole('status');
    expect(container).toHaveClass('custom-empty-state');
  });
});