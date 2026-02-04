import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '../../test/test-utils';
import userEvent from '@testing-library/user-event';
import { Pagination } from '../Pagination';

const mockSearchParams = new URLSearchParams();
const mockSetSearchParams = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useSearchParams: () => [mockSearchParams, mockSetSearchParams]
  };
});

describe('Pagination', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render pagination controls', () => {
    render(
      <Pagination
        currentPage={1}
        totalPages={5}
        totalCount={100}
        pageSize={20}
      />
    );

    expect(screen.getByText('Previous')).toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();
    expect(screen.getByText(/Showing 1-20 of 100/)).toBeInTheDocument();
  });

  it('should disable previous button on first page', () => {
    render(
      <Pagination
        currentPage={1}
        totalPages={5}
        totalCount={100}
        pageSize={20}
      />
    );

    const prevButton = screen.getByText('Previous').closest('button');
    expect(prevButton).toBeDisabled();
  });

  it('should disable next button on last page', () => {
    render(
      <Pagination
        currentPage={5}
        totalPages={5}
        totalCount={100}
        pageSize={20}
      />
    );

    const nextButton = screen.getByText('Next').closest('button');
    expect(nextButton).toBeDisabled();
  });

  it('should show correct range for middle page', () => {
    render(
      <Pagination
        currentPage={3}
        totalPages={10}
        totalCount={200}
        pageSize={20}
      />
    );

    expect(screen.getByText(/Showing 41-60 of 200/)).toBeInTheDocument();
  });

  it('should show correct range for last page with partial results', () => {
    render(
      <Pagination
        currentPage={5}
        totalPages={5}
        totalCount={95}
        pageSize={20}
      />
    );

    expect(screen.getByText(/Showing 81-95 of 95/)).toBeInTheDocument();
  });

  it('should call setSearchParams when clicking page number', async () => {
    const user = userEvent.setup();
    
    render(
      <Pagination
        currentPage={1}
        totalPages={5}
        totalCount={100}
        pageSize={20}
      />
    );

    const pageButton = screen.getByText('2');
    await user.click(pageButton);

    expect(mockSetSearchParams).toHaveBeenCalled();
  });

  it('should call setSearchParams when clicking next', async () => {
    const user = userEvent.setup();
    
    render(
      <Pagination
        currentPage={1}
        totalPages={5}
        totalCount={100}
        pageSize={20}
      />
    );

    const nextButton = screen.getByText('Next');
    await user.click(nextButton);

    expect(mockSetSearchParams).toHaveBeenCalled();
  });

  it('should call setSearchParams when clicking previous', async () => {
    const user = userEvent.setup();
    
    render(
      <Pagination
        currentPage={2}
        totalPages={5}
        totalCount={100}
        pageSize={20}
      />
    );

    const prevButton = screen.getByText('Previous');
    await user.click(prevButton);

    expect(mockSetSearchParams).toHaveBeenCalled();
  });

  it('should highlight current page', () => {
    render(
      <Pagination
        currentPage={3}
        totalPages={5}
        totalCount={100}
        pageSize={20}
      />
    );

    const currentPageButton = screen.getByText('3').closest('button');
    expect(currentPageButton).toHaveClass('bg-purple-600');
  });
});
