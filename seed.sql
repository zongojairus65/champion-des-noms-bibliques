create table if not exists mots (nom text primary key);
insert into mots (nom) values
('Samuel'),('Saul'),('Sem'),('Léa'),('Esther'),('Ève'),('David'),('Dan'),('Moïse'),('Noé'),
('Adam'),('Abel'),('Caïn'),('Job'),('Ruth'),('Élie'),('Isaac'),('Jacob'),('Joseph'),('Déborah'),
('Marie'),('Pierre'),('Paul'),('Luc'),('Marc'),('Jean'),('Anne'),('Éli'),('Ésaïe'),('Jonas'),
('Lot'),('Sara'),('Aaron'),('Simon'),('Jude'),('Esdras'),('Amos'),('Joël'),('Osée'),('Hénoc'),
('Gad'),('Aser'),('Judas'),('Lazare'),('Marthe'),('Rachel'),('Rebecca'),('Salomon'),('Daniel'),('Gédéon')
on conflict do nothing;
