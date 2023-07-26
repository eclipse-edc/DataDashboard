import {Component, OnInit} from '@angular/core';
import data from '../../../../data.json';
import { PostService } from './post.service';


@Component({
  selector: 'edc-demo-introduction',
  templateUrl: './catalog-browser-confirmation.component.html',
  styleUrls: ['./catalog-browser-confirmation.component.scss']
})

export class CatalogBrowserConfirmation implements OnInit{
  id = data[0].id;
  provider = data[0].provider;
  start = data[0].contractStart;
  consumer = data[0].consumer;

  posts:any;
  
  constructor(private service:PostService) {}
  
  ngOnInit() {
      this.service.getPosts()
        .subscribe(response => {
          this.posts = response;
        });
  } 
}
