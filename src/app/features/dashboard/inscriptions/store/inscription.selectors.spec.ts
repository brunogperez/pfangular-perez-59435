import {
  selectorInscriptions,
  selectorInscriptionsByProduct,
  selectorInscriptionError,
  selectorIsLoadingInscriptions,
  selectInscriptionState,
} from './inscription.selectors';
import { State, initialState } from './inscription.reducer';
import { Inscription } from '../models';

const mockInscription: Inscription = {
  id: 'i1',
  clientId: 'c1',
  productId: 'p1',
};

const mockState: State = {
  ...initialState,
  inscriptions: [mockInscription],
  isLoadingInscription: false,
  loadInscriptionError: null,
};

describe('Inscription Selectors', () => {
  it('selectInscriptionState debe retornar el estado del feature', () => {
    const result = selectInscriptionState.projector(mockState);
    expect(result).toEqual(mockState);
  });

  it('selectorInscriptions debe retornar la lista de inscripciones', () => {
    const result = selectorInscriptions.projector(mockState);
    expect(result).toEqual([mockInscription]);
  });

  it('selectorInscriptionsByProduct debe retornar inscripciones', () => {
    const result = selectorInscriptionsByProduct.projector(mockState);
    expect(result).toEqual([mockInscription]);
  });

  it('selectorInscriptionError debe retornar null cuando no hay error', () => {
    const result = selectorInscriptionError.projector(mockState);
    expect(result).toBeNull();
  });

  it('selectorInscriptionError debe retornar el error cuando existe', () => {
    const errorState: State = { ...mockState, loadInscriptionError: new Error('Test') };
    const result = selectorInscriptionError.projector(errorState);
    expect(result).toBeTruthy();
  });

  it('selectorIsLoadingInscriptions debe retornar false', () => {
    const result = selectorIsLoadingInscriptions.projector(mockState);
    expect(result).toBeFalse();
  });

  it('selectorIsLoadingInscriptions debe retornar true cuando carga', () => {
    const loadingState: State = { ...mockState, isLoadingInscription: true };
    const result = selectorIsLoadingInscriptions.projector(loadingState);
    expect(result).toBeTrue();
  });
});
