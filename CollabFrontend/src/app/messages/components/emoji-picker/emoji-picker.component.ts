import { Component, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-emoji-picker',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  template: `
    <div class="emoji-picker" (click)="$event.stopPropagation()">
      <div class="emoji-grid">
        @for (emoji of popularEmojis; track emoji) {
          <button 
            mat-button 
            class="emoji-button"
            (click)="selectEmoji(emoji)"
            [title]="emoji">
            {{ emoji }}
          </button>
        }
      </div>
    </div>
  `,
  styles: [`
    .emoji-picker {
      position: absolute;
      bottom: 100%;
      left: 0;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      padding: 12px;
      z-index: 1000;
      border: 1px solid rgba(0, 0, 0, 0.1);
    }

    .emoji-grid {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 4px;
      max-width: 240px;
    }

    .emoji-button {
      min-width: 32px;
      height: 32px;
      padding: 0;
      font-size: 18px;
      border-radius: 6px;
      transition: all 0.2s ease;
    }

    .emoji-button:hover {
      background-color: rgba(0, 0, 0, 0.1);
      transform: scale(1.2);
    }

    @media (prefers-color-scheme: dark) {
      .emoji-picker {
        background: #333;
        border-color: rgba(255, 255, 255, 0.2);
      }

      .emoji-button:hover {
        background-color: rgba(255, 255, 255, 0.1);
      }
    }
  `]
})
export class EmojiPickerComponent {
  @Output() emojiSelected = new EventEmitter<string>();
  @Output() clickOutside = new EventEmitter<void>();

  popularEmojis = [
    '😀', '😃', '😄', '😁', '😅', '😂',
    '😊', '😇', '🙂', '🙃', '😉', '😌',
    '😍', '🥰', '😘', '😗', '😙', '😚',
    '😋', '😛', '😝', '😜', '🤪', '🤨',
    '🧐', '🤓', '😎', '🤩', '🥳', '😏',
    '😒', '😞', '😔', '😟', '😕', '🙁',
    '☹️', '😣', '😖', '😫', '😩', '🥺',
    '😢', '😭', '😤', '😠', '😡', '🤬',
    '🤯', '😳', '🥵', '🥶', '😱', '😨',
    '😰', '😥', '😓', '🤗', '🤔', '🤭',
    '🤫', '🤥', '😶', '😐', '😑', '😬',
    '🙄', '😯', '😦', '😧', '😮', '😲',
    '🥱', '😴', '🤤', '😪', '😵', '🤐',
    '🥴', '🤢', '🤮', '🤧', '😷', '🤒',
    '🤕', '🤑', '🤠', '😈', '👿', '👹',
    '👺', '🤡', '💩', '👻', '💀', '☠️',
    '👽', '👾', '🤖', '🎃', '😺', '😸',
    '😹', '😻', '😼', '😽', '🙀', '😿',
    '😾', '❤️', '🧡', '💛', '💚', '💙',
    '💜', '🤎', '🖤', '🤍', '💔', '❣️',
    '💕', '💞', '💓', '💗', '💖', '💘',
    '💝', '💟', '👍', '👎', '👌', '🤌',
    '🤏', '✌️', '🤞', '🤟', '🤘', '🤙',
    '👈', '👉', '👆', '🖕', '👇', '☝️',
    '👋', '🤚', '🖐️', '✋', '🖖', '👏',
    '🙌', '🤝', '🙏', '💪', '🦾', '🦿'
  ];

  @HostListener('document:click', ['$event'])
  onDocumentClick() {
    this.clickOutside.emit();
  }

  selectEmoji(emoji: string) {
    this.emojiSelected.emit(emoji);
  }
}