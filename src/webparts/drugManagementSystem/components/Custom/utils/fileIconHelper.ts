/**
 * File Icon Helper - Returns appropriate FontAwesome icon and color based on file type
 */

import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { 
  faFileWord, 
  faFileExcel, 
  faFilePdf, 
  faFilePowerpoint, 
  faFileAlt, 
  faFileArchive, 
  faFile,
  faFileImage,
  faFileVideo,
  faFileAudio,
  faFileCode
} from '@fortawesome/free-solid-svg-icons';

export interface FileIconInfo {
  icon: IconDefinition;
  color: string;
  bgColor: string;
  iconName: string;
}

export class FileIconHelper {
  static getFileIcon(fileName: string): FileIconInfo {
    const ext = (fileName || '').split('.').pop()?.toLowerCase() || '';
    
    switch (ext) {
      case 'doc':
      case 'docx':
        return {
          icon: faFileWord,
          iconName: 'file-word',
          color: '#2B579A',
          bgColor: '#E3EFFF'
        };
      case 'xls':
      case 'xlsx':
      case 'csv':
        return {
          icon: faFileExcel,
          iconName: 'file-excel',
          color: '#217346',
          bgColor: '#E6F4EA'
        };
      case 'pdf':
        return {
          icon: faFilePdf,
          iconName: 'file-pdf',
          color: '#D32F2F',
          bgColor: '#FFEBEE'
        };
      case 'ppt':
      case 'pptx':
        return {
          icon: faFilePowerpoint,
          iconName: 'file-powerpoint',
          color: '#D24726',
          bgColor: '#FFF3E0'
        };
      case 'txt':
      case 'rtf':
        return {
          icon: faFileAlt,
          iconName: 'file-alt',
          color: '#616161',
          bgColor: '#F5F5F5'
        };
      case 'zip':
      case 'rar':
      case 'tar':
      case 'gz':
      case '7z':
        return {
          icon: faFileArchive,
          iconName: 'file-archive',
          color: '#795548',
          bgColor: '#EFEBE9'
        };
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'bmp':
      case 'svg':
        return {
          icon: faFileImage,
          iconName: 'file-image',
          color: '#E91E63',
          bgColor: '#FCE4EC'
        };
      case 'mp4':
      case 'avi':
      case 'mov':
      case 'wmv':
      case 'mkv':
        return {
          icon: faFileVideo,
          iconName: 'file-video',
          color: '#9C27B0',
          bgColor: '#F3E5F5'
        };
      case 'mp3':
      case 'wav':
      case 'flac':
      case 'aac':
        return {
          icon: faFileAudio,
          iconName: 'file-audio',
          color: '#FF5722',
          bgColor: '#FBE9E7'
        };
      case 'js':
      case 'ts':
      case 'tsx':
      case 'jsx':
      case 'html':
      case 'css':
      case 'json':
      case 'xml':
        return {
          icon: faFileCode,
          iconName: 'file-code',
          color: '#00BCD4',
          bgColor: '#E0F7FA'
        };
      default:
        return {
          icon: faFile,
          iconName: 'file',
          color: '#424242',
          bgColor: '#EEEEEE'
        };
    }
  }

  static getFileTypeDisplay(fileName: string): string {
    const ext = (fileName || '').split('.').pop()?.toUpperCase() || 'FILE';
    return ext;
  }
}
