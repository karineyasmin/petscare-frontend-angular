import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../../material.module';
import { PetsInfoService } from '../../services/pets-info.service';

@Component({
  selector: 'app-breed-search',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, HttpClientModule, FormsModule, MaterialModule, RouterModule],
  templateUrl: './breed-search.component.html',
  styleUrls: ['./breed-search.component.css']
})
export class BreedSearchComponent {
  breedSearchForm: FormGroup;
  loading = false;
  error: string | null = null;
  breedResults: any[] = [];
  filteredResults: any[] = [];
  filterText: string = '';
  species: string = '';

  constructor(
    private fb: FormBuilder,
    private petsInfoService: PetsInfoService
  ) {
    this.breedSearchForm = this.fb.group({
      species: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.breedSearchForm.valid) {
      this.loading = true;
      this.error = null;
      this.breedResults = [];
      this.filteredResults = [];
      this.species = this.breedSearchForm.value.species;
      
      this.petsInfoService.getBreeds(this.species).subscribe({
        next: (data) => {
          console.log('Dados recebidos:', data);
          
          // Transformar os dados para garantir que todos os campos estejam disponíveis
          this.breedResults = data.map(breed => {
            // Se for um gato e não tiver descrição definida, usar o temperamento como descrição
            if (this.species === 'cat' && !breed.description && breed.temperament) {
              breed.description = breed.temperament;
            }
            
            // Garantir que o peso esteja em um formato padrão
            if (breed.weight && typeof breed.weight === 'object') {
              // Já está no formato correto
            } else if (breed.weight && typeof breed.weight === 'string') {
              try {
                breed.weight = { metric: breed.weight };
              } catch (e) {
                console.error('Erro ao processar peso:', e);
              }
            }
            
            return breed;
          });
          
          this.filteredResults = [...this.breedResults];
          this.loading = false;
        },
        error: (err) => {
          console.error('Erro ao buscar raças:', err);
          this.error = `Erro ao buscar raças: ${err.message}`;
          this.loading = false;
        }
      });
    }
  }

  filterResults(): void {
    if (!this.filterText.trim()) {
      this.filteredResults = [...this.breedResults];
      return;
    }
    
    const searchTerm = this.filterText.toLowerCase().trim();
    this.filteredResults = this.breedResults.filter(breed => 
      breed.name.toLowerCase().includes(searchTerm)
    );
  }
  
  getSpeciesName(species: string): string {
    switch (species.toLowerCase()) {
      case 'dog':
        return 'Raças de Cachorro';
      case 'cat':
        return 'Raças de Gato';
      default:
        return 'Raças';
    }
  }
}