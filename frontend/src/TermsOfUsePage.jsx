import "bootstrap/dist/css/bootstrap.min.css";
import "./auth-theme.css";
import "./legal-pages.css";

import logo from "./assets/logo-azneo-full.png";


export default function TermsOfUsePage({
  onBack,
}) {
  return (
    <div className="az-legal-page">

      {/* DECORAÇÃO DO FUNDO */}

      <div className="az-circuit circuit-top-left">
        <span />
        <span />
        <span />
      </div>

      <div className="az-circuit circuit-top-right">
        <span />
        <span />
        <span />
      </div>

      <div className="az-circuit circuit-bottom-left">
        <span />
        <span />
        <span />
      </div>

      <div className="az-circuit circuit-bottom-right">
        <span />
        <span />
        <span />
      </div>


      {/* CONTEÚDO */}

      <div className="az-legal-container">

        <div className="az-legal-logo-wrap">
          <img
            src={logo}
            alt="AZNEO"
            className="az-legal-logo"
          />
        </div>


        <div className="az-legal-card">

          <div className="az-legal-header">

            <h1>
              Termos de Uso
            </h1>

            <p>
              Última atualização:
              30 de agosto de 2026
            </p>

          </div>


          <LegalSection title="1. Aceitação dos Termos">

            <p>
              Ao criar uma conta ou utilizar a plataforma AZNEO,
              o usuário declara que leu e concorda com estes
              Termos de Uso.
            </p>

            <p>
              Caso não concorde com estas condições, o usuário
              não deverá utilizar os serviços da plataforma.
            </p>

          </LegalSection>


          <LegalSection title="2. Cadastro">

            <p>
              Para utilizar determinadas funcionalidades da AZNEO,
              o usuário deverá criar uma conta e fornecer
              informações verdadeiras, completas e atualizadas.
            </p>

            <p>
              A AZNEO poderá solicitar informações necessárias
              à identificação do usuário, segurança da conta e
              cumprimento de obrigações legais.
            </p>

          </LegalSection>


          <LegalSection title="3. Segurança da Conta">

            <p>
              O usuário é responsável por manter sua senha e
              demais credenciais de acesso em segurança.
            </p>

            <p>
              As credenciais não devem ser compartilhadas
              com terceiros.
            </p>

            <p>
              Caso seja identificado acesso não autorizado,
              o usuário deverá comunicar a AZNEO.
            </p>

          </LegalSection>


          <LegalSection title="4. Uso da Plataforma">

            <p>
              O usuário se compromete a utilizar a AZNEO
              exclusivamente para finalidades lícitas.
            </p>

            <p>
              É proibida a utilização da plataforma para fraude,
              manipulação de informações, invasões, ataques ou
              qualquer atividade que comprometa o funcionamento
              do sistema.
            </p>

          </LegalSection>


          <LegalSection title="5. Produtos">

            <p>
              Os produtos apresentados poderão conter informações
              como nome, descrição, preço, estoque, marca,
              imagens e especificações técnicas.
            </p>

            <p>
              A disponibilidade está sujeita ao estoque existente
              no momento da compra.
            </p>

          </LegalSection>


          <LegalSection title="6. Preços">

            <p>
              Os preços apresentados na plataforma poderão ser
              alterados antes da conclusão da compra.
            </p>

            <p>
              Após a confirmação do pedido, prevalecerão os
              valores registrados naquela transação.
            </p>

          </LegalSection>


          <LegalSection title="7. Pagamentos">

            <p>
              Os pagamentos poderão ser realizados através dos
              meios disponibilizados pela plataforma.
            </p>

            <p>
              A aprovação do pagamento poderá depender de
              instituições financeiras ou intermediadores externos.
            </p>

          </LegalSection>


          <LegalSection title="8. Entrega">

            <p>
              Os prazos de entrega apresentados poderão variar
              conforme localização, transportadora, disponibilidade
              do produto e demais fatores logísticos.
            </p>

          </LegalSection>


          <LegalSection title="9. Cancelamentos e Devoluções">

            <p>
              Cancelamentos, devoluções e reembolsos observarão
              a legislação aplicável e as condições informadas
              pela plataforma.
            </p>

          </LegalSection>


          <LegalSection title="10. Propriedade Intelectual">

            <p>
              Marcas, logotipos, interfaces, textos, elementos
              gráficos e demais conteúdos da AZNEO são protegidos
              pela legislação aplicável.
            </p>

          </LegalSection>


          <LegalSection title="11. Suspensão de Contas">

            <p>
              A AZNEO poderá restringir ou suspender contas quando
              identificar fraude, uso indevido, violação destes
              Termos ou riscos à segurança da plataforma.
            </p>

          </LegalSection>


          <LegalSection title="12. Disponibilidade da Plataforma">

            <p>
              A plataforma poderá passar por manutenções,
              atualizações ou interrupções temporárias.
            </p>

          </LegalSection>


          <LegalSection title="13. Privacidade">

            <p>
              O tratamento de dados pessoais é disciplinado pela
              Política de Privacidade da AZNEO.
            </p>

          </LegalSection>


          <LegalSection title="14. Alterações dos Termos">

            <p>
              Estes Termos poderão ser atualizados em razão de
              alterações na plataforma ou na legislação aplicável.
            </p>

          </LegalSection>


          <LegalSection title="15. Legislação Aplicável">

            <p>
              Estes Termos são regidos pela legislação brasileira.
            </p>

          </LegalSection>


          <div className="az-legal-back-wrap">

            <button
              type="button"
              onClick={onBack}
              className="az-legal-back"
            >
              ← Voltar
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}


function LegalSection({
  title,
  children,
}) {
  return (
    <section className="az-legal-section">

      <h2>
        {title}
      </h2>

      <div>
        {children}
      </div>

    </section>
  );
}