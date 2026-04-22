--
-- PostgreSQL database dump
--

\restrict bBD2J3cT90I5FOi7MHCB6VuwKKBmkfSz7TyH6EXjE2NRRQARKeX1MUlpLcPbaf8

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.users (id, email, password_hash, role, created_at) VALUES ('5015bb1c-2f07-407e-be2b-2b402edee098', 'artist@sonicverse.com', '$2b$10$SxnXh88VoMXaaXxUWZQevu/C7BR/XsNe9twZZU5thiXqBjJAyFhz6', 'artist', '2026-03-31 17:07:47.789387+03');
INSERT INTO public.users (id, email, password_hash, role, created_at) VALUES ('9dccfcd8-97b3-419c-b8c5-8fdc48608070', 'markdennis05771@gmail.com', '$2b$10$yS7K9g5AvSxKL2LMeK6SNe3/KAJY6pBDLAx652/ehAGsoQm38oXS2', 'user', '2026-03-31 17:08:47.05679+03');
INSERT INTO public.users (id, email, password_hash, role, created_at) VALUES ('fcab668e-0fda-4d5b-ac8b-f1b25d911bcc', 'markdennis05771@gmal.com', '$2b$10$J6RtTUFQOshPL69mA5FZz.z7BK6Mp7L.po9gGsxOr4WPG5QLqS1HO', 'user', '2026-04-21 08:47:17.310457+03');
INSERT INTO public.users (id, email, password_hash, role, created_at) VALUES ('02c95fe3-a799-410b-aba7-f096c167fb66', 'dennismiringu03@gmail.com', '$2b$10$GeJVWXRdiKfmtbXNHs/EFOohyW6AtMAYPfdPNUWNDELpx9B5KNo82', 'user', '2026-04-21 14:00:45.756099+03');


--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.profiles (id, user_id, username, display_name, bio, avatar_url, location, social_links, xp_points, level, created_at) VALUES ('dc0ef3f8-de3e-4376-97a0-29b8eae4f3fb', '5015bb1c-2f07-407e-be2b-2b402edee098', 'synth_voyager', 'Synth Voyager', 'Exploring the digital frontiers of sound.', NULL, NULL, '{}', 0, 1, '2026-03-31 17:07:47.849726+03');
INSERT INTO public.profiles (id, user_id, username, display_name, bio, avatar_url, location, social_links, xp_points, level, created_at) VALUES ('fdc38d2c-b321-4c3f-8b11-f438cac703f9', '9dccfcd8-97b3-419c-b8c5-8fdc48608070', 'oxfg', 'oxfg', NULL, NULL, NULL, '{}', 0, 1, '2026-03-31 17:08:47.05679+03');
INSERT INTO public.profiles (id, user_id, username, display_name, bio, avatar_url, location, social_links, xp_points, level, created_at) VALUES ('5ad18fb2-9390-4e93-bcb5-6dc0f87a87b3', 'fcab668e-0fda-4d5b-ac8b-f1b25d911bcc', 'mindfork', 'mindfork', NULL, NULL, NULL, '{}', 0, 1, '2026-04-21 08:47:17.310457+03');
INSERT INTO public.profiles (id, user_id, username, display_name, bio, avatar_url, location, social_links, xp_points, level, created_at) VALUES ('d37961f9-8954-4b13-be58-08cd8161e243', '02c95fe3-a799-410b-aba7-f096c167fb66', 'yoursTruly', 'yoursTruly', NULL, NULL, NULL, '{}', 0, 1, '2026-04-21 14:00:45.756099+03');


--
-- Data for Name: artists; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.artists (id, profile_id, verified, genre_tags, bio) VALUES ('591988ef-b8d9-47fa-bdb7-f697ee490633', 'dc0ef3f8-de3e-4376-97a0-29b8eae4f3fb', true, '{Synthwave,Electronic}', NULL);


--
-- Data for Name: follows; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: likes; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: playlists; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: songs; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.songs (id, artist_id, title, audio_url, cover_url, duration, bpm, mood_tags, dna_data, lyrics, created_at) VALUES ('a32b083c-e28f-45da-a16c-ef3e90ed891e', '591988ef-b8d9-47fa-bdb7-f697ee490633', 'Neon Dreams', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=800', NULL, NULL, '{Energetic,Neon}', '{}', '[]', '2026-03-31 17:07:47.942369+03');
INSERT INTO public.songs (id, artist_id, title, audio_url, cover_url, duration, bpm, mood_tags, dna_data, lyrics, created_at) VALUES ('7cdfa9d6-d32a-43e9-b50f-a557de5a7d7f', '591988ef-b8d9-47fa-bdb7-f697ee490633', 'Cyber Beats', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800', NULL, NULL, '{Dark,Futuristic}', '{}', '[]', '2026-03-31 17:07:47.942369+03');
INSERT INTO public.songs (id, artist_id, title, audio_url, cover_url, duration, bpm, mood_tags, dna_data, lyrics, created_at) VALUES ('8303d950-643c-4b03-8b79-0355c79f7b91', '591988ef-b8d9-47fa-bdb7-f697ee490633', 'Digital Sunset', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800', NULL, NULL, '{Chill,Euphoric}', '{}', '[]', '2026-03-31 17:07:47.942369+03');


--
-- Data for Name: playlist_songs; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: posts; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.posts (id, user_id, song_id, content, media_url, created_at) VALUES ('2bbeaf13-8222-4d04-a5d1-adc9a79345eb', '5015bb1c-2f07-407e-be2b-2b402edee098', NULL, 'Just dropped some new synthwave vibes! Check out Neon Dreams on my profile.', NULL, '2026-03-31 17:07:47.968628+03');


--
-- Data for Name: samples; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: transactions; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- PostgreSQL database dump complete
--

\unrestrict bBD2J3cT90I5FOi7MHCB6VuwKKBmkfSz7TyH6EXjE2NRRQARKeX1MUlpLcPbaf8

