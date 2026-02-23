import { reducer, initialState, State } from './inscription.reducer';
import { InscriptionActions } from './inscription.actions';
import { Inscription } from '../models';

const mockInscription: Inscription = {
  id: 'i1',
  clientId: 'c1',
  productId: 'p1',
};

const mockInscription2: Inscription = {
  id: 'i2',
  clientId: 'c2',
  productId: 'p1',
};

describe('Inscription Reducer', () => {
  it('debe retornar el estado inicial', () => {
    const action = { type: 'Unknown' } as any;
    const state = reducer(undefined, action);
    expect(state).toEqual(initialState);
  });

  // Load Inscriptions
  it('loadInscriptionsSuccess debe cargar las inscripciones', () => {
    const data = [mockInscription, mockInscription2];
    const action = InscriptionActions.loadInscriptionsSuccess({ data });
    const state = reducer(initialState, action);
    expect(state.inscriptions).toEqual(data);
    expect(state.loadInscriptionError).toBeNull();
  });

  it('loadInscriptionsFailure debe establecer el error', () => {
    const error = new Error('Error de red');
    const action = InscriptionActions.loadInscriptionsFailure({ error });
    const state = reducer(initialState, action);
    expect(state.loadInscriptionError).toEqual(error);
  });

  // Load Inscriptions By Product
  it('loadInscriptionsByProductSuccess debe cargar inscripciones filtradas', () => {
    const data = [mockInscription];
    const action = InscriptionActions.loadInscriptionsByProductSuccess({ data });
    const state = reducer(initialState, action);
    expect(state.inscriptions).toEqual(data);
  });

  // Create Inscription
  it('createInscription debe agregar inscripcion al estado', () => {
    const prevState: State = { ...initialState, inscriptions: [mockInscription] };
    const action = InscriptionActions.createInscription({ productId: 'p2', clientId: 'c3' });
    const state = reducer(prevState, action);
    expect(state.inscriptions.length).toBe(2);
    expect(state.inscriptions[1].productId).toBe('p2');
    expect(state.inscriptions[1].clientId).toBe('c3');
  });

  // Delete Inscription
  it('deleteInscription debe remover la inscripcion por clientId', () => {
    const prevState: State = { ...initialState, inscriptions: [mockInscription, mockInscription2] };
    const action = InscriptionActions.deleteInscription({ id: 'c1' });
    const state = reducer(prevState, action);
    expect(state.inscriptions.length).toBe(1);
    expect(state.inscriptions[0].clientId).toBe('c2');
  });
});
