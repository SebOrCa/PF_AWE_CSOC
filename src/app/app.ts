import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './shared/components/navbar/navbar';
import { RoleSwitcher } from './shared/components/role-switcher/role-switcher';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, RoleSwitcher],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
