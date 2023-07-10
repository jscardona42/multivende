import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CatalogsComponent } from './components/catalogs/catalogs.component';
import { LogicTestComponent } from './components/logic-test/logic-test.component';
import { AuthenticationComponent } from './components/authentication/authentication.component';

const routes: Routes = [
  { path: 'catalogs', component: CatalogsComponent },
  { path: 'logic-test', component: LogicTestComponent },
  { path: 'authentication', component: AuthenticationComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
