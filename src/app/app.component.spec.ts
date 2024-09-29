import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create the component', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should have a RouterOutlet', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const routerOutlet = fixture.debugElement.query(
      (el) => el.name === 'router-outlet'
    );
    expect(routerOutlet).not.toBeNull();
  });
});
