
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL DEFAULT 'anon',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles readable by all" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1), 'anon'))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE public.battles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt text NOT NULL,
  featured_on date,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.battles TO authenticated, anon;
GRANT ALL ON public.battles TO service_role;
ALTER TABLE public.battles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "battles readable by all" ON public.battles FOR SELECT USING (true);

CREATE TABLE public.votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id uuid NOT NULL REFERENCES public.battles(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  author_label text,
  side text NOT NULL CHECK (side IN ('agree','disagree')),
  argument text NOT NULL CHECK (char_length(argument) BETWEEN 3 AND 240),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX votes_one_per_user_battle ON public.votes (user_id, battle_id) WHERE user_id IS NOT NULL;
GRANT SELECT, INSERT, UPDATE ON public.votes TO authenticated;
GRANT SELECT ON public.votes TO anon;
GRANT ALL ON public.votes TO service_role;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "votes readable by all" ON public.votes FOR SELECT USING (true);
CREATE POLICY "own vote insert" ON public.votes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own vote update" ON public.votes FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.coin_spends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vote_id uuid NOT NULL REFERENCES public.votes(id) ON DELETE CASCADE,
  spend_date date NOT NULL DEFAULT (now() AT TIME ZONE 'utc')::date,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, vote_id)
);
GRANT SELECT, INSERT ON public.coin_spends TO authenticated;
GRANT SELECT ON public.coin_spends TO anon;
GRANT ALL ON public.coin_spends TO service_role;
ALTER TABLE public.coin_spends ENABLE ROW LEVEL SECURITY;
CREATE POLICY "spends readable by all" ON public.coin_spends FOR SELECT USING (true);
CREATE POLICY "own spend insert" ON public.coin_spends FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.enforce_coin_rules()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_owner uuid;
  spent_today int;
BEGIN
  SELECT user_id INTO target_owner FROM public.votes WHERE id = NEW.vote_id;
  IF target_owner IS NOT NULL AND target_owner = NEW.user_id THEN
    RAISE EXCEPTION 'You cannot spend coins on your own argument';
  END IF;
  SELECT count(*) INTO spent_today FROM public.coin_spends
    WHERE user_id = NEW.user_id AND spend_date = NEW.spend_date;
  IF spent_today >= 10 THEN
    RAISE EXCEPTION 'No coins left today';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER coin_rules BEFORE INSERT ON public.coin_spends
FOR EACH ROW EXECUTE FUNCTION public.enforce_coin_rules();

INSERT INTO public.battles (prompt, sort_order) VALUES
('Pineapple belongs on pizza', 1),
('Working from home makes you worse at your job', 2),
('Tipping should be abolished', 3),
('Social media did more harm than good', 4),
('Voting should be mandatory', 5),
('Reading the book first ruins the film', 6),
('Nobody actually needs a car in a city', 7),
('Group chats are worse than phone calls', 8),
('Kids should not have smartphones before 14', 9),
('The four-day week should be standard', 10),
('Art made by machines is still art', 11),
('Being on time is a moral obligation', 12),
('Cash should stay forever', 13),
('You should be allowed to rate your neighbours', 14);

INSERT INTO public.votes (battle_id, user_id, author_label, side, argument)
SELECT b.id, NULL, v.label, v.side, v.argument
FROM public.battles b
JOIN (VALUES
  ('Pineapple belongs on pizza','agree','mira','Sweet against salt is the oldest trick in cooking. It works.'),
  ('Pineapple belongs on pizza','disagree','tomas','Heat turns it to warm juice and drowns the base.'),
  ('Pineapple belongs on pizza','agree','ravi','Everyone pretending to hate it orders it at 2am.'),
  ('Working from home makes you worse at your job','disagree','june','My output doubled the day I stopped commuting.'),
  ('Working from home makes you worse at your job','agree','felix','You lose the ten-second questions that stop week-long mistakes.'),
  ('Tipping should be abolished','agree','sana','Pay people a wage. Do not make dinner a performance review.'),
  ('Tipping should be abolished','disagree','odin','Remove it and the money quietly goes to the owner, not the staff.'),
  ('Social media did more harm than good','agree','lena','It taught a generation that attention and worth are the same thing.'),
  ('Social media did more harm than good','disagree','kwame','It also gave people without a platform an actual platform.'),
  ('Voting should be mandatory','disagree','ines','A forced vote is noise, not a mandate.'),
  ('Voting should be mandatory','agree','bo','Turnout stops being a strategy the moment everyone shows up.')
) AS v(prompt, side, label, argument) ON v.prompt = b.prompt;
