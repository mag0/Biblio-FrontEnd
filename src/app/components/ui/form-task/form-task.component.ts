import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-form-task',
  templateUrl: './form-task.component.html',
  styleUrls: ['./form-task.component.css'],
  imports: [ReactiveFormsModule, CommonModule]
})
export class FormTaskComponent implements OnInit {
  @Input() isEditMode: boolean = false;
  @Input() taskId: string | null = null;
  @Input() set taskData(data: any) {
    if (data) {
      let formattedDate = '';
      if (data.limitDate) {
        const date = new Date(data.limitDate);
        formattedDate = date.toISOString().split('T')[0];
      }

      this.formTask.patchValue({
        name: data.name,
        description: data.description,
        limitDate: formattedDate,
        status: data.status
      });

      if (data.filePath) {
        this.currentFileName = data.filePath.split('\\').pop() || data.filePath.split('/').pop() || data.filePath;
      }
    }
  }
  @Output() formSubmitted = new EventEmitter<FormData>();
  formTask: FormGroup;
  selectedFile: File | null = null;
  currentFileName: string = '';

  constructor(
    private fb: FormBuilder
  ) {
    this.formTask = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(5)]],
      limitDate: ['', Validators.required],
      status: ['Pendiente'],
      file: [null]
    });
  }

  ngOnInit(): void {
    if (this.isEditMode) {
      this.formTask.get('status')?.enable();
    } else {
      this.formTask.get('status')?.disable();
    }
  }

  goBack() {
    window.history.back();
  }

  onFileSelected(event: Event): void {
    const element = event.currentTarget as HTMLInputElement;
    let fileList: FileList | null = element.files;
  
    if (fileList && fileList.length > 0) {
      this.selectedFile = fileList[0];
      this.currentFileName = this.selectedFile.name;
      this.formTask.patchValue({ archivo: this.selectedFile });
    } else {
      this.selectedFile = null;
      this.currentFileName = '';
      this.formTask.patchValue({ archivo: null });
    }
  }

  onSubmit(): void {
    console.log(this.formTask);
    if (this.formTask.valid) {
      const formData = new FormData();
      formData.append('name', this.formTask.get('name')?.value);
      formData.append('description', this.formTask.get('description')?.value);
      formData.append('limitDate', this.formTask.get('limitDate')?.value);
      formData.append('status', this.formTask.get('status')?.value);

      if (this.selectedFile) {
        formData.append('file', this.selectedFile);
      }

      this.formSubmitted.emit(formData);
    } else {
      Object.keys(this.formTask.controls).forEach(key => {
        const control = this.formTask.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
    }
  }

  getErrorMessage(controlName: string): string {
    const control = this.formTask.get(controlName);
    if (control?.hasError('required')) {
      return 'Este campo es requerido';
    }
    if (control?.hasError('minlength')) {
      const requiredLength = control.errors?.['minlength'].requiredLength;
      return `Debe tener al menos ${requiredLength} caracteres`;
    }
    return '';
  }
}